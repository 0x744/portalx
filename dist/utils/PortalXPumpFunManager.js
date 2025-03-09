"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXPumpFunManager = void 0;
const web3_js_1 = require("@solana/web3.js");
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
const PUMPFUN_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const RAYDIUM_PROGRAM_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
class PortalXPumpFunManager {
    constructor(client) {
        this.PUMPFUN_PROGRAM_ID = new web3_js_1.PublicKey(PUMPFUN_PROGRAM_ID);
        this.RAYDIUM_PROGRAM_ID = new web3_js_1.PublicKey(RAYDIUM_PROGRAM_ID);
        this.client = client;
        logger.info(`Initialized with PUMPFUN_PROGRAM_ID: ${this.PUMPFUN_PROGRAM_ID.toString()}`);
        logger.info(`Initialized with RAYDIUM_PROGRAM_ID: ${this.RAYDIUM_PROGRAM_ID.toString()}`);
    }
    async launchToken(metadata, devFunds, initialSupply, bondingCurveParams) {
        try {
            // Generate a new dev wallet
            const devWallet = web3_js_1.Keypair.generate();
            const devPublicKey = devWallet.publicKey.toString();
            const devPrivateKey = Buffer.from(devWallet.secretKey).toString('hex');
            logger.info(`Attempting to launch token with program ID: ${this.PUMPFUN_PROGRAM_ID.toString()}`);
            // Fund dev wallet
            const funderKey = process.env.FUNDER_PRIVATE_KEY;
            if (!funderKey) {
                throw new Error('Funder private key not configured');
            }
            await this.client.sendTransaction(funderKey, devPublicKey, devFunds);
            // Create token with metadata
            const createTokenTx = new web3_js_1.Transaction().add({
                keys: [
                    { pubkey: devWallet.publicKey, isSigner: true, isWritable: true },
                    { pubkey: this.PUMPFUN_PROGRAM_ID, isSigner: false, isWritable: false }
                ],
                programId: this.PUMPFUN_PROGRAM_ID,
                data: Buffer.from([
                    // Instruction data for create token
                    ...Buffer.from(metadata.name),
                    ...Buffer.from(metadata.symbol),
                    ...Buffer.from(metadata.imageUrl),
                    ...Buffer.from(metadata.description),
                    ...Buffer.from(metadata.socials.x || ''),
                    ...Buffer.from(metadata.socials.tg || ''),
                    ...new Uint8Array(new Float64Array([initialSupply]).buffer),
                    ...new Uint8Array(new Float64Array([bondingCurveParams.startPrice]).buffer),
                    ...new Uint8Array(new Float64Array([bondingCurveParams.maxPrice]).buffer),
                    ...new Uint8Array(new Float64Array([bondingCurveParams.curveFactor]).buffer)
                ])
            });
            const signature = await this.client.sendTransaction(devPrivateKey, devPublicKey, 0);
            logger.info(`Token launched successfully: ${signature}`);
            // Extract token mint address from transaction
            const tokenMint = await this.extractTokenMint(signature);
            return {
                tokenMint: tokenMint,
                devWallet: devPrivateKey
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to launch token: ${errorMessage}`);
            throw error;
        }
    }
    async snipePostMigration(tokenMint, amount, devWallet, targetPrice, params) {
        try {
            if (tokenMint === 'TOKEN_MINT_HERE') {
                console.log('Placeholder error: Invalid token mint - Please replace with real token mint');
                return 'Placeholder: Transaction skipped';
            }
            // Monitor Raydium migration
            const connection = await this.client.getActiveConnection();
            const programId = new web3_js_1.PublicKey(this.RAYDIUM_PROGRAM_ID);
            const subscriptionId = connection.onProgramAccountChange(programId, async (accountInfo) => {
                const tokenAddress = accountInfo.accountId.toString();
                if (tokenAddress === tokenMint) {
                    // Check if price matches target (if specified)
                    if (targetPrice) {
                        const currentPrice = await this.getTokenPrice(tokenMint);
                        if (currentPrice > targetPrice) {
                            return; // Price too high, skip
                        }
                    }
                    // Check minimum price if specified in params
                    if (params?.minPrice) {
                        const currentPrice = await this.getTokenPrice(tokenMint);
                        if (currentPrice < params.minPrice) {
                            return; // Price too low, skip
                        }
                    }
                    // Execute snipe with retry logic if specified
                    let retryCount = 0;
                    const maxRetries = params?.retryCount || 3;
                    while (retryCount < maxRetries) {
                        try {
                            const signature = await this.client.sendTransaction(devWallet, tokenMint, amount);
                            logger.info(`Token sniped successfully: ${signature}`);
                            connection.removeProgramAccountChangeListener(subscriptionId);
                            return;
                        }
                        catch (error) {
                            retryCount++;
                            if (retryCount === maxRetries) {
                                logger.error(`Failed to snipe token after ${maxRetries} attempts`);
                                throw error;
                            }
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
                        }
                    }
                }
            });
            // Set timeout for snipe operation
            const timeout = params?.timeout || 30000; // Default 30 seconds
            setTimeout(() => {
                connection.removeProgramAccountChangeListener(subscriptionId);
                logger.warn('Snipe operation timed out');
            }, timeout);
            return 'Snipe operation initiated';
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to snipe token: ${errorMessage}`);
            throw error;
        }
    }
    async extractTokenMint(signature) {
        const connection = await this.client.getActiveConnection();
        const tx = await connection.getTransaction(signature);
        if (!tx)
            throw new Error('Transaction not found');
        // Extract token mint from transaction logs
        const logs = tx.meta?.logMessages || [];
        const mintLog = logs.find(log => log.includes('Token mint created'));
        if (!mintLog)
            throw new Error('Token mint not found in transaction logs');
        // Extract mint address from log message
        const match = mintLog.match(/Token mint created: ([A-Za-z0-9]{32,})/);
        if (!match)
            throw new Error('Could not extract token mint address');
        return match[1];
    }
    async getTokenPrice(tokenMint) {
        // Implement price fetching logic from Raydium
        // This is a placeholder - actual implementation would depend on Raydium's API
        return 0;
    }
}
exports.PortalXPumpFunManager = PortalXPumpFunManager;
