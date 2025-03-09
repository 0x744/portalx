import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PortalXEncryption } from './PortalXEncryption';
import winston from 'winston';
import { Worker } from 'worker_threads';

export interface WalletData {
  publicKey: string;
  privateKey: string;
  label: string;
  balance: number;
}

export class PortalXWalletManager {
  private wallets: WalletData[] = [];
  private readonly STORAGE_KEY = 'portalx_wallets';
  private readonly ENCRYPTION_KEY = 'your-secure-encryption-key-replace-in-production-32chars';
  private logger: winston.Logger;
  private connection: Connection;
  private balanceSubscriptions: Map<string, number> = new Map();

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    this.loadWallets();
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const storage = window.localStorage;
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  async generateWallets(count: number): Promise<WalletData[]> {
    try {
      const worker = new Worker(new URL('../workers/walletWorker.ts', import.meta.url));
      return new Promise((resolve, reject) => {
        worker.postMessage({ count });
        worker.addListener('message', (e: MessageEvent) => {
          const newWallets = e.data.map((wallet: { publicKey: string; privateKey: string }) => ({
            ...wallet,
            label: `Wallet ${this.wallets.length + 1}`,
            balance: 0
          }));
          this.wallets = [...this.wallets, ...newWallets];
          this.saveWallets();
          worker.terminate();
          resolve(newWallets);
        });
        worker.addListener('error', (error: ErrorEvent) => {
          this.logger.error('Error generating wallets:', error);
          worker.terminate();
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error('Failed to generate wallets:', error);
      throw error;
    }
  }

  async exportWallets(): Promise<string> {
    try {
      const encrypted = await PortalXEncryption.encrypt(
        JSON.stringify(this.wallets),
        this.ENCRYPTION_KEY
      );
      return encrypted;
    } catch (error) {
      this.logger.error('Error exporting wallets:', error);
      throw error;
    }
  }

  async importWallets(walletData: string): Promise<void> {
    try {
      let wallets: WalletData[];
      try {
        // First try to decrypt, in case it's encrypted data
        const decrypted = await PortalXEncryption.decrypt(walletData, this.ENCRYPTION_KEY);
        wallets = JSON.parse(decrypted);
      } catch (error) {
        // If decryption fails, try parsing as plain JSON
        wallets = JSON.parse(walletData);
      }
      
      this.wallets = [...this.wallets, ...wallets];
      await this.saveWallets();
      this.logger.info(`Imported ${wallets.length} wallets`);
    } catch (error) {
      this.logger.error('Error importing wallets:', error);
      throw error;
    }
  }

  async getWallets(): Promise<WalletData[]> {
    return this.wallets;
  }

  async addWallet(label: string): Promise<WalletData> {
    const keypair = Keypair.generate();
    const wallet: WalletData = {
      publicKey: keypair.publicKey.toString(),
      privateKey: Buffer.from(keypair.secretKey).toString('base64'),
      label,
      balance: 0
    };
    this.wallets.push(wallet);
    await this.saveWallets();
    return wallet;
  }

  async removeWallet(publicKey: string): Promise<void> {
    this.wallets = this.wallets.filter(w => w.publicKey !== publicKey);
    await this.saveWallets();
  }

  async updateWalletBalance(publicKey: string, balance: number): Promise<void> {
    const wallet = this.wallets.find(w => w.publicKey === publicKey);
    if (wallet) {
      wallet.balance = balance;
      await this.saveWallets();
    }
  }

  async getWallet(publicKey: string): Promise<WalletData | undefined> {
    return this.wallets.find(w => w.publicKey === publicKey);
  }

  async updateWalletLabel(publicKey: string, label: string): Promise<void> {
    const wallet = this.wallets.find(w => w.publicKey === publicKey);
    if (wallet) {
      wallet.label = label;
      await this.saveWallets();
      this.logger.info(`Updated label for wallet ${publicKey}`);
    }
  }

  private async loadWallets(): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        this.logger.warn('localStorage is not available');
        return;
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          const decrypted = await PortalXEncryption.decrypt(stored, this.ENCRYPTION_KEY);
          this.wallets = JSON.parse(decrypted);
          this.logger.info(`Loaded ${this.wallets.length} wallets from storage`);
        } catch (error) {
          this.logger.error('Error decrypting stored wallets:', error);
          throw error;
        }
      }
    } catch (error) {
      this.logger.error('Error loading wallets:', error);
      throw error;
    }
  }

  private async saveWallets(): Promise<void> {
    try {
      if (!this.isLocalStorageAvailable()) {
        this.logger.warn('localStorage is not available');
        return;
      }

      const encrypted = await PortalXEncryption.encrypt(JSON.stringify(this.wallets), this.ENCRYPTION_KEY);
      localStorage.setItem(this.STORAGE_KEY, encrypted);
      this.logger.info('Wallets saved to storage');
    } catch (error) {
      this.logger.error('Error saving wallets:', error);
      throw error;
    }
  }

  async fundWallet(address: string, amount: number): Promise<void> {
    // Implementation for funding wallet
    this.logger.info(`Funding wallet ${address} with ${amount} SOL`);
  }

  async sendTransaction(address: string, amount: number): Promise<void> {
    // Implementation for sending transaction
    this.logger.info(`Sending ${amount} SOL to ${address}`);
  }

  async distributeSOL(address: string, amount: number): Promise<void> {
    try {
      await this.sendTransaction(address, amount);
      this.logger.info(`Distributed ${amount} SOL to ${address}`);
    } catch (error) {
      this.logger.error(`Failed to distribute SOL to ${address}:`, error);
      throw error;
    }
  }

  async startBalanceMonitoring(publicKey: string): Promise<void> {
    try {
      const wallet = await this.getWallet(publicKey);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const pubkey = new PublicKey(publicKey);
      const subscriptionId = this.connection.onAccountChange(
        pubkey,
        (account) => {
          const balance = account.lamports / LAMPORTS_PER_SOL;
          this.updateWalletBalance(publicKey, balance);
        },
        'confirmed'
      );

      this.balanceSubscriptions.set(publicKey, subscriptionId);
      this.logger.info(`Started balance monitoring for wallet ${publicKey}`);
    } catch (error) {
      this.logger.error(`Failed to start balance monitoring for ${publicKey}:`, error);
      throw error;
    }
  }

  async stopBalanceMonitoring(publicKey: string): Promise<void> {
    try {
      const subscriptionId = this.balanceSubscriptions.get(publicKey);
      if (subscriptionId) {
        await this.connection.removeAccountChangeListener(subscriptionId);
        this.balanceSubscriptions.delete(publicKey);
        this.logger.info(`Stopped balance monitoring for wallet ${publicKey}`);
      }
    } catch (error) {
      this.logger.error(`Failed to stop balance monitoring for ${publicKey}:`, error);
      throw error;
    }
  }

  async stopAllBalanceMonitoring(): Promise<void> {
    try {
      for (const [publicKey, subscriptionId] of this.balanceSubscriptions.entries()) {
        await this.connection.removeAccountChangeListener(subscriptionId);
        this.balanceSubscriptions.delete(publicKey);
        this.logger.info(`Stopped balance monitoring for wallet ${publicKey}`);
      }
    } catch (error) {
      this.logger.error('Failed to stop all balance monitoring:', error);
      throw error;
    }
  }

  clearWallets(): void {
    this.wallets = [];
    this.logger.info('Cleared all wallets');
  }

  async getFunderWallet(): Promise<WalletData> {
    // First try to find an existing funder wallet
    const funderWallet = this.wallets.find(w => w.label === 'Funder Wallet');
    if (funderWallet) {
      return funderWallet;
    }

    // If no funder wallet exists, create one
    const wallet = await this.addWallet('Funder Wallet');
    this.logger.info(`Created new funder wallet: ${wallet.publicKey}`);
    return wallet;
  }
} 