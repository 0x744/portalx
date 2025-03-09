"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXWalletManager = void 0;
const web3_js_1 = require("@solana/web3.js");
const PortalXEncryption_1 = require("./PortalXEncryption");
const winston_1 = __importDefault(require("winston"));
const worker_threads_1 = require("worker_threads");
class PortalXWalletManager {
    constructor() {
        this.wallets = [];
        this.STORAGE_KEY = 'portalx_wallets';
        this.ENCRYPTION_KEY = 'your-secure-encryption-key';
        this.balanceSubscriptions = new Map();
        this.logger = winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [
                new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'combined.log' })
            ]
        });
        this.connection = new web3_js_1.Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        this.loadWallets();
    }
    isLocalStorageAvailable() {
        try {
            const storage = window.localStorage;
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async generateWallets(count) {
        try {
            const worker = new worker_threads_1.Worker(new URL('../workers/walletWorker.ts', import.meta.url));
            return new Promise((resolve, reject) => {
                worker.postMessage({ count });
                worker.addListener('message', (e) => {
                    const newWallets = e.data.map((wallet) => ({
                        ...wallet,
                        label: `Wallet ${this.wallets.length + 1}`,
                        balance: 0
                    }));
                    this.wallets = [...this.wallets, ...newWallets];
                    this.saveWallets();
                    worker.terminate();
                    resolve(newWallets);
                });
                worker.addListener('error', (error) => {
                    this.logger.error('Error generating wallets:', error);
                    worker.terminate();
                    reject(error);
                });
            });
        }
        catch (error) {
            this.logger.error('Failed to generate wallets:', error);
            throw error;
        }
    }
    async exportWallets() {
        return JSON.stringify(this.wallets, null, 2);
    }
    async importWallets(walletData) {
        try {
            const wallets = JSON.parse(walletData);
            this.wallets = [...this.wallets, ...wallets];
            await this.saveWallets();
            this.logger.info(`Imported ${wallets.length} wallets`);
        }
        catch (error) {
            this.logger.error('Error importing wallets:', error);
            throw error;
        }
    }
    async getWallets() {
        return this.wallets;
    }
    async addWallet(label) {
        const keypair = web3_js_1.Keypair.generate();
        const wallet = {
            publicKey: keypair.publicKey.toString(),
            privateKey: Buffer.from(keypair.secretKey).toString('base64'),
            label,
            balance: 0
        };
        this.wallets.push(wallet);
        await this.saveWallets();
        return wallet;
    }
    async removeWallet(publicKey) {
        this.wallets = this.wallets.filter(w => w.publicKey !== publicKey);
        await this.saveWallets();
    }
    async updateWalletBalance(publicKey, balance) {
        const wallet = this.wallets.find(w => w.publicKey === publicKey);
        if (wallet) {
            wallet.balance = balance;
            await this.saveWallets();
        }
    }
    async getWallet(publicKey) {
        return this.wallets.find(w => w.publicKey === publicKey);
    }
    async updateWalletLabel(publicKey, label) {
        const wallet = this.wallets.find(w => w.publicKey === publicKey);
        if (wallet) {
            wallet.label = label;
            await this.saveWallets();
            this.logger.info(`Updated label for wallet ${publicKey}`);
        }
    }
    async loadWallets() {
        try {
            if (!this.isLocalStorageAvailable()) {
                this.logger.warn('localStorage is not available');
                return;
            }
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const decrypted = await PortalXEncryption_1.PortalXEncryption.decrypt(stored, this.ENCRYPTION_KEY);
                this.wallets = JSON.parse(decrypted);
                this.logger.info(`Loaded ${this.wallets.length} wallets from storage`);
            }
        }
        catch (error) {
            this.logger.error('Error loading wallets:', error);
        }
    }
    async saveWallets() {
        try {
            if (!this.isLocalStorageAvailable()) {
                this.logger.warn('localStorage is not available');
                return;
            }
            const encrypted = await PortalXEncryption_1.PortalXEncryption.encrypt(JSON.stringify(this.wallets), this.ENCRYPTION_KEY);
            localStorage.setItem(this.STORAGE_KEY, encrypted);
            this.logger.info('Wallets saved to storage');
        }
        catch (error) {
            this.logger.error('Error saving wallets:', error);
            throw error;
        }
    }
    async fundWallet(address, amount) {
        // Implementation for funding wallet
        this.logger.info(`Funding wallet ${address} with ${amount} SOL`);
    }
    async sendTransaction(address, amount) {
        // Implementation for sending transaction
        this.logger.info(`Sending ${amount} SOL to ${address}`);
    }
    async distributeSOL(address, amount) {
        try {
            await this.sendTransaction(address, amount);
            this.logger.info(`Distributed ${amount} SOL to ${address}`);
        }
        catch (error) {
            this.logger.error(`Failed to distribute SOL to ${address}:`, error);
            throw error;
        }
    }
    async startBalanceMonitoring(publicKey) {
        try {
            const wallet = await this.getWallet(publicKey);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            const pubkey = new web3_js_1.PublicKey(publicKey);
            const subscriptionId = this.connection.onAccountChange(pubkey, (account) => {
                const balance = account.lamports / web3_js_1.LAMPORTS_PER_SOL;
                this.updateWalletBalance(publicKey, balance);
            }, 'confirmed');
            this.balanceSubscriptions.set(publicKey, subscriptionId);
            this.logger.info(`Started balance monitoring for wallet ${publicKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to start balance monitoring for ${publicKey}:`, error);
            throw error;
        }
    }
    async stopBalanceMonitoring(publicKey) {
        try {
            const subscriptionId = this.balanceSubscriptions.get(publicKey);
            if (subscriptionId) {
                await this.connection.removeAccountChangeListener(subscriptionId);
                this.balanceSubscriptions.delete(publicKey);
                this.logger.info(`Stopped balance monitoring for wallet ${publicKey}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to stop balance monitoring for ${publicKey}:`, error);
            throw error;
        }
    }
    async stopAllBalanceMonitoring() {
        try {
            for (const [publicKey, subscriptionId] of this.balanceSubscriptions.entries()) {
                await this.connection.removeAccountChangeListener(subscriptionId);
                this.balanceSubscriptions.delete(publicKey);
                this.logger.info(`Stopped balance monitoring for wallet ${publicKey}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to stop all balance monitoring:', error);
            throw error;
        }
    }
}
exports.PortalXWalletManager = PortalXWalletManager;
