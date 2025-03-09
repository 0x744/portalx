"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXQueueManager = void 0;
const web3_js_1 = require("@solana/web3.js");
const PortalXWalletManager_1 = require("./PortalXWalletManager");
const axios_1 = __importDefault(require("axios"));
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.simple(),
    transports: [
        new winston_1.default.transports.File({ filename: 'portalx.log' }),
        new winston_1.default.transports.Console()
    ]
});
// WARNING: Using testnet configuration
const TOKEN_MINT = "BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8S";
const targetPrice = 0.001;
const slippage = 0.01;
class PortalXQueueManager {
    constructor(client) {
        this.queue = [];
        this.isProcessing = false;
        this.PUMPFUN_PROGRAM_ID = new web3_js_1.PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
        this.MAX_BATCH_SIZE = 3;
        this.MIN_DELAY_MS = 1000;
        this.CHANGENOW_API_KEY = 'test-api-key';
        this.transactionConfigs = new Map();
        this.TOKEN_MINT = new web3_js_1.PublicKey(TOKEN_MINT);
        this.client = client;
        this.walletManager = new PortalXWalletManager_1.PortalXWalletManager();
        if (this.PUMPFUN_PROGRAM_ID.toString() === 'PUMPFUN_PROGRAM_ID_HERE') {
            console.log('Placeholder error: Using placeholder Pump.fun program ID - Replace with real ID for production');
        }
        if (this.CHANGENOW_API_KEY === 'test-api-key') {
            console.log('Placeholder error: Using test ChangeNow API key - Replace with real key for production');
        }
    }
    async addToQueue(tx, privateKey, priority = 0, config = { maxRetries: 3, timeout: 30000 }) {
        const item = {
            tx,
            privateKey,
            priority,
            timestamp: Date.now(),
            config
        };
        this.queue.push(item);
        logger.info(`Added transaction to queue with priority ${priority}`);
        await this.processQueue();
    }
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0)
            return;
        this.isProcessing = true;
        try {
            // Sort queue by priority and timestamp
            this.queue.sort((a, b) => {
                if (a.priority !== b.priority)
                    return b.priority - a.priority;
                return a.timestamp - b.timestamp;
            });
            // Process in batches
            const batchSize = 5;
            const batches = Math.ceil(this.queue.length / batchSize);
            for (let i = 0; i < batches; i++) {
                const batch = this.queue.slice(i * batchSize, (i + 1) * batchSize);
                await Promise.all(batch.map(item => this.processItem(item)));
            }
            // Clear processed items
            this.queue = this.queue.filter(item => !item.tx.signatures.length);
        }
        catch (error) {
            logger.error('Queue processing error:', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
    async processItem(item) {
        try {
            logger.info(`Processing transaction with placeholder token mint: ${TOKEN_MINT}`);
            await this.client.sendTransaction(item.privateKey, item.tx.instructions[0].keys[1].pubkey.toString(), 0, item.config.maxRetries);
        }
        catch (error) {
            logger.error('Transaction processing error:', error);
            if (item.config.maxRetries > 0) {
                item.config.maxRetries--;
                this.queue.push(item);
            }
        }
    }
    async bundleOnBondingCurve(tokenMint, totalSol, walletCount, options = {}) {
        try {
            // Generate wallets if needed
            const wallets = await this.walletManager.getWallets();
            if (wallets.length < walletCount) {
                for (let i = 0; i < walletCount - wallets.length; i++) {
                    await this.walletManager.addWallet(`Wallet ${wallets.length + i + 1}`);
                }
                // Refresh wallets after generation
                const updatedWallets = await this.walletManager.getWallets();
                wallets.push(...updatedWallets.slice(wallets.length));
            }
            // Distribute funds randomly
            const amounts = this.randomDistribute(totalSol, walletCount, options.minAmount, options.maxAmount);
            // Fund wallets using ChangeNow or direct transfer
            for (let i = 0; i < wallets.length; i++) {
                if (options.useChangeNow && this.CHANGENOW_API_KEY) {
                    await this.fundWithChangeNow(wallets[i].publicKey, amounts[i]);
                }
                else {
                    await this.client.sendTransaction(process.env.FUNDER_PRIVATE_KEY || '', wallets[i].publicKey, amounts[i]);
                }
                // Add random delay between funding transactions
                const delay = this.getRandomDelay(options.delayRange);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // Create buy transactions for the bonding curve
            for (const wallet of wallets) {
                const buyTx = this.createBondingCurveBuyTx(new web3_js_1.PublicKey(tokenMint), new web3_js_1.PublicKey(wallet.publicKey), amounts[0] // Use first amount as example
                );
                this.addToQueue(buyTx, wallet.privateKey, 0);
            }
            // Start processing the queue
            await this.processQueue();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to bundle on bonding curve: ${errorMessage}`);
            throw error;
        }
    }
    async sellTokens(tokenMint, percentage, centralWallet, options = {}) {
        try {
            const wallets = await this.walletManager.getWallets();
            const batchSize = options.batchSize || this.MAX_BATCH_SIZE;
            for (let i = 0; i < wallets.length; i += batchSize) {
                const batch = wallets.slice(i, i + batchSize);
                // Create sell transactions for the batch
                for (const wallet of batch) {
                    const sellTx = this.createBondingCurveSellTx(new web3_js_1.PublicKey(tokenMint), new web3_js_1.PublicKey(wallet.publicKey), new web3_js_1.PublicKey(centralWallet), percentage);
                    this.addToQueue(sellTx, wallet.privateKey, 1);
                }
                // Process the batch
                await this.processQueue();
                // Add random delay between batches
                const delay = this.getRandomDelay([options.minDelay || 2000, options.maxDelay || 5000]);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to sell tokens: ${errorMessage}`);
            throw error;
        }
    }
    async fundWithChangeNow(address, amount) {
        try {
            const response = await axios_1.default.post('https://api.changenow.io/v1/transactions', {
                from: 'sol',
                to: 'sol',
                amount,
                address,
                api_key: this.CHANGENOW_API_KEY
            });
            logger.info(`Funded wallet ${address} via ChangeNow: ${response.data.id}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to fund wallet via ChangeNow: ${errorMessage}`);
            throw error;
        }
    }
    createBondingCurveBuyTx(tokenMint, buyerPubkey, amount) {
        return new web3_js_1.Transaction().add({
            keys: [
                { pubkey: buyerPubkey, isSigner: true, isWritable: true },
                { pubkey: tokenMint, isSigner: false, isWritable: true }
            ],
            programId: this.PUMPFUN_PROGRAM_ID,
            data: Buffer.from([
                // Buy instruction data
                ...new Uint8Array(new Float64Array([amount]).buffer)
            ])
        });
    }
    createBondingCurveSellTx(tokenMint, sellerPubkey, centralWallet, percentage) {
        return new web3_js_1.Transaction().add({
            keys: [
                { pubkey: sellerPubkey, isSigner: true, isWritable: true },
                { pubkey: tokenMint, isSigner: false, isWritable: true },
                { pubkey: centralWallet, isSigner: false, isWritable: true }
            ],
            programId: this.PUMPFUN_PROGRAM_ID,
            data: Buffer.from([
                // Sell instruction data with percentage
                ...new Uint8Array(new Float64Array([percentage]).buffer)
            ])
        });
    }
    randomDistribute(total, count, minAmount, maxAmount) {
        const amounts = [];
        let remaining = total;
        const min = minAmount || 0.01; // Default minimum 0.01 SOL
        const max = maxAmount || total / count * 2; // Default maximum 2x average
        for (let i = 0; i < count - 1; i++) {
            const maxPossible = Math.min(max, remaining - min * (count - i - 1));
            const minPossible = Math.max(min, remaining - max * (count - i - 1));
            const amount = minPossible + Math.random() * (maxPossible - minPossible);
            amounts.push(amount);
            remaining -= amount;
        }
        amounts.push(remaining);
        return amounts;
    }
    getRandomDelay(range) {
        const [min, max] = range || [this.MIN_DELAY_MS, this.MIN_DELAY_MS * 2];
        return min + Math.random() * (max - min);
    }
    async createSellTransaction(walletAddress, tokenMint, amount, targetPrice, slippage) {
        try {
            const wallets = await this.walletManager.getWallets();
            const wallet = wallets.find(w => w.publicKey === walletAddress);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            const transaction = new web3_js_1.Transaction();
            // Add token program instructions for selling
            transaction.add(web3_js_1.SystemProgram.transfer({
                fromPubkey: new web3_js_1.PublicKey(walletAddress),
                toPubkey: new web3_js_1.PublicKey(tokenMint),
                lamports: amount
            }));
            const signature = await this.client.sendTransaction(wallet.privateKey, tokenMint, amount);
            if (!signature) {
                throw new Error('Failed to get transaction signature');
            }
            // Add to transaction configs with high priority
            this.transactionConfigs.set(signature, {
                priority: 'high',
                maxRetries: 3,
                timeout: 30000 // 30 seconds
            });
            logger.info(`Created sell transaction: ${signature}`);
            return signature;
        }
        catch (error) {
            logger.error('Failed to create sell transaction:', error);
            throw error;
        }
    }
    async distributeTokens(walletCount, amount, options = {}) {
        try {
            if (TOKEN_MINT === "BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8S") {
                console.log('Placeholder error: Cannot distribute tokens with placeholder mint');
                return;
            }
            // Generate wallets if needed
            const wallets = await this.walletManager.getWallets();
            if (wallets.length < walletCount) {
                for (let i = 0; i < walletCount - wallets.length; i++) {
                    await this.walletManager.addWallet(`Wallet ${wallets.length + i + 1}`);
                }
                // Refresh wallets after generation
                const updatedWallets = await this.walletManager.getWallets();
                wallets.push(...updatedWallets.slice(wallets.length));
            }
            // Fund wallets using ChangeNow or direct transfer
            for (let i = 0; i < wallets.length; i++) {
                if (options.useChangeNow && this.CHANGENOW_API_KEY) {
                    await this.fundWithChangeNow(wallets[i].publicKey, amount);
                }
                else {
                    await this.client.sendTransaction(process.env.FUNDER_PRIVATE_KEY || '', wallets[i].publicKey, amount);
                }
            }
            // ... rest of the code ...
        }
        catch (error) {
            logger.error('Distribute tokens error:', error);
            throw error;
        }
    }
    async getWalletBalance(walletAddress) {
        try {
            const wallets = await this.walletManager.getWallets();
            const wallet = wallets.find((w) => w.publicKey === walletAddress);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            const connection = await this.client.getActiveConnection();
            const balance = await connection.getBalance(new web3_js_1.PublicKey(walletAddress));
            return balance / 1e9; // Convert lamports to SOL
        }
        catch (error) {
            logger.error('Failed to get wallet balance:', error);
            throw error;
        }
    }
}
exports.PortalXQueueManager = PortalXQueueManager;
