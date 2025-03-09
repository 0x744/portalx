"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXTokenSell = void 0;
const web3_js_1 = require("@solana/web3.js");
const PortalXWalletManager_1 = require("./PortalXWalletManager");
const winston_1 = __importDefault(require("winston"));
class PortalXTokenSell {
    constructor(client) {
        this.client = client;
        this.walletManager = new PortalXWalletManager_1.PortalXWalletManager();
        this.logger = winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [
                new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'combined.log' })
            ]
        });
    }
    async sellTokens(devWallet, subWallets, tokenMint, config) {
        try {
            const sellTxs = [];
            switch (config.mode) {
                case 'dumpAll':
                    sellTxs.push(...await Promise.all([devWallet, ...subWallets].map(w => this.createSellAllTx(w, tokenMint))));
                    break;
                case 'dumpAllPercent':
                    if (!config.percentage)
                        throw new Error('Percentage required for dumpAllPercent mode');
                    sellTxs.push(...await Promise.all([devWallet, ...subWallets].map(w => this.createSellPercentTx(w, tokenMint, config.percentage))));
                    break;
                case 'singleSell':
                    if (!config.percentage)
                        throw new Error('Percentage required for singleSell mode');
                    sellTxs.push(await this.createSellPercentTx(devWallet, tokenMint, config.percentage));
                    break;
                case 'raydiumDumpAll':
                    await this.prepareRaydium(tokenMint, devWallet);
                    sellTxs.push(...await Promise.all([devWallet, ...subWallets].map(w => this.createRaydiumSellTx(w, tokenMint, 100))));
                    break;
                case 'raydiumSingleSell':
                    if (!config.percentage)
                        throw new Error('Percentage required for raydiumSingleSell mode');
                    await this.prepareRaydium(tokenMint, devWallet);
                    sellTxs.push(await this.createRaydiumSellTx(devWallet, tokenMint, config.percentage));
                    break;
                case 'sendSPL':
                    // First send all tokens to dev wallet
                    sellTxs.push(...await Promise.all(subWallets.map(w => this.createTransferToDevTx(w, devWallet.publicKey, tokenMint))));
                    // Then sell all from dev wallet
                    sellTxs.push(await this.createSellAllTx(devWallet, tokenMint));
                    break;
                case 'devSell':
                    sellTxs.push(await this.createSellAllTx(devWallet, tokenMint));
                    break;
            }
            // Add priority fee to all transactions
            sellTxs.forEach(tx => {
                tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: config.jitoTipAmount * 1e6
                }));
            });
            // Send all transactions
            return await Promise.all(sellTxs.map(tx => this.sendTransaction(tx, config)));
        }
        catch (error) {
            this.logger.error('Failed to sell tokens:', error);
            throw error;
        }
    }
    async prepareRaydium(tokenMint, devWallet) {
        const poolExists = await this.checkRaydiumPool(tokenMint);
        if (!poolExists) {
            const tx = new web3_js_1.Transaction().add(await this.createRaydiumPoolIx(tokenMint));
            await this.client.sendTransaction(devWallet.secretKey.toString(), tokenMint.toString(), 0);
        }
    }
    async checkRaydiumPool(tokenMint) {
        // Implement Raydium pool check logic
        return false;
    }
    async createRaydiumPoolIx(tokenMint) {
        // Implement Raydium pool creation instruction
        throw new Error('Not implemented');
    }
    async createSellAllTx(wallet, tokenMint) {
        // Implement sell all tokens instruction
        throw new Error('Not implemented');
    }
    async createSellPercentTx(wallet, tokenMint, percentage) {
        // Implement sell percentage of tokens instruction
        throw new Error('Not implemented');
    }
    async createRaydiumSellTx(wallet, tokenMint, percentage) {
        // Implement Raydium sell instruction
        throw new Error('Not implemented');
    }
    async createTransferToDevTx(wallet, devPubkey, tokenMint) {
        // Implement transfer tokens to dev wallet instruction
        throw new Error('Not implemented');
    }
    async sendTransaction(tx, config) {
        const connection = await this.client.getActiveConnection();
        switch (config.sendMode) {
            case 'hybrid':
                try {
                    return await connection.sendRawTransaction(tx.serialize());
                }
                catch {
                    return await connection.sendRawTransaction(tx.serialize());
                }
            case 'jito':
                return await connection.sendRawTransaction(tx.serialize());
            case 'bloxroute':
                if (!config.bloxrouteEndpoint)
                    throw new Error('Bloxroute endpoint required');
                const response = await fetch(config.bloxrouteEndpoint, {
                    method: 'POST',
                    body: tx.serialize()
                });
                return await response.text();
            case 'rpc':
                return await connection.sendRawTransaction(tx.serialize());
            default:
                throw new Error('Invalid send mode');
        }
    }
}
exports.PortalXTokenSell = PortalXTokenSell;
