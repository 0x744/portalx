import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js';
import { PortalXBlockchainClient } from './PortalXBlockchainClient';
import { PortalXWalletManager, WalletData } from './PortalXWalletManager';
import { PortalXValidation } from './PortalXValidation';
import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'portalx.log' }),
    new winston.transports.Console()
  ]
});

interface QueueItem {
  tx: Transaction;
  privateKey: string;
  priority: number;
  timestamp: number;
  config: {
    maxRetries: number;
    timeout: number;
  };
}

interface TransactionConfig {
  priority: 'high' | 'medium' | 'low';
  maxRetries: number;
  timeout: number;
}

interface DistributionOptions {
  batchSize?: number;
  useChangeNow?: boolean;
  delayRange?: [number, number];
}

// WARNING: Using testnet configuration
const TOKEN_MINT = "BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8S";

const targetPrice = 0.001;
const slippage = 0.01;

export class PortalXQueueManager {
  private client: PortalXBlockchainClient;
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;

  private readonly PUMPFUN_PROGRAM_ID = new PublicKey('PUMPFUN_PROGRAM_ID_HERE');
  private readonly MAX_BATCH_SIZE = 3;
  private readonly MIN_DELAY_MS = 1000;
  private readonly CHANGENOW_API_KEY = 'test-api-key';
  private transactionConfigs = new Map<string, TransactionConfig>();
  private readonly walletManager: PortalXWalletManager;
  private readonly TOKEN_MINT = new PublicKey(TOKEN_MINT);

  constructor(client: PortalXBlockchainClient) {
    this.client = client;
    this.walletManager = new PortalXWalletManager();
    if (this.PUMPFUN_PROGRAM_ID.toString() === 'PUMPFUN_PROGRAM_ID_HERE') {
      console.log('Placeholder error: Using placeholder Pump.fun program ID - Replace with real ID for production');
    }
    if (this.CHANGENOW_API_KEY === 'test-api-key') {
      console.log('Placeholder error: Using test ChangeNow API key - Replace with real key for production');
    }
  }

  async addToQueue(
    tx: Transaction,
    privateKey: string,
    priority: number = 0,
    config: { maxRetries: number; timeout: number } = { maxRetries: 3, timeout: 30000 }
  ): Promise<void> {
    const item: QueueItem = {
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

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      // Sort queue by priority and timestamp
      this.queue.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.timestamp - b.timestamp;
      });

      // Process in batches
      const batchSize = 5;
      const batches = Math.ceil(this.queue.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = this.queue.slice(i * batchSize, (i + 1) * batchSize);
        await Promise.all(
          batch.map(item => this.processItem(item))
        );
      }

      // Clear processed items
      this.queue = this.queue.filter(item => !item.tx.signatures.length);
    } catch (error) {
      logger.error('Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: QueueItem): Promise<void> {
    try {
      logger.info(`Processing transaction with placeholder token mint: ${TOKEN_MINT}`);
      await this.client.sendTransaction(
        item.privateKey,
        item.tx.instructions[0].keys[1].pubkey.toString(),
        0,
        item.config.maxRetries
      );
    } catch (error) {
      logger.error('Transaction processing error:', error);
      if (item.config.maxRetries > 0) {
        item.config.maxRetries--;
        this.queue.push(item);
      }
    }
  }

  async bundleOnBondingCurve(
    tokenMint: string,
    totalSol: number,
    walletCount: number,
    options: {
      minAmount?: number;
      maxAmount?: number;
      delayRange?: [number, number];
      useChangeNow?: boolean;
    } = {}
  ): Promise<void> {
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
        } else {
          await this.client.sendTransaction(
            process.env.FUNDER_PRIVATE_KEY || '',
            wallets[i].publicKey,
            amounts[i]
          );
        }

        // Add random delay between funding transactions
        const delay = this.getRandomDelay(options.delayRange);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Create buy transactions for the bonding curve
      for (const wallet of wallets) {
        const buyTx = this.createBondingCurveBuyTx(
          new PublicKey(tokenMint),
          new PublicKey(wallet.publicKey),
          amounts[0] // Use first amount as example
        );

        this.addToQueue(buyTx, wallet.privateKey, 0);
      }

      // Start processing the queue
      await this.processQueue();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to bundle on bonding curve: ${errorMessage}`);
      throw error;
    }
  }

  async sellTokens(
    tokenMint: string,
    percentage: number,
    centralWallet: string,
    options: {
      minDelay?: number;
      maxDelay?: number;
      batchSize?: number;
    } = {}
  ): Promise<void> {
    try {
      const wallets = await this.walletManager.getWallets();
      const batchSize = options.batchSize || this.MAX_BATCH_SIZE;

      for (let i = 0; i < wallets.length; i += batchSize) {
        const batch = wallets.slice(i, i + batchSize);
        
        // Create sell transactions for the batch
        for (const wallet of batch) {
          const sellTx = this.createBondingCurveSellTx(
            new PublicKey(tokenMint),
            new PublicKey(wallet.publicKey),
            new PublicKey(centralWallet),
            percentage
          );

          this.addToQueue(sellTx, wallet.privateKey, 1);
        }

        // Process the batch
        await this.processQueue();

        // Add random delay between batches
        const delay = this.getRandomDelay([options.minDelay || 2000, options.maxDelay || 5000]);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to sell tokens: ${errorMessage}`);
      throw error;
    }
  }

  private async fundWithChangeNow(address: string, amount: number): Promise<void> {
    try {
      const response = await axios.post('https://api.changenow.io/v1/transactions', {
        from: 'sol',
        to: 'sol',
        amount,
        address,
        api_key: this.CHANGENOW_API_KEY
      });
      logger.info(`Funded wallet ${address} via ChangeNow: ${response.data.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to fund wallet via ChangeNow: ${errorMessage}`);
      throw error;
    }
  }

  private createBondingCurveBuyTx(
    tokenMint: PublicKey,
    buyerPubkey: PublicKey,
    amount: number
  ): Transaction {
    return new Transaction().add({
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

  private createBondingCurveSellTx(
    tokenMint: PublicKey,
    sellerPubkey: PublicKey,
    centralWallet: PublicKey,
    percentage: number
  ): Transaction {
    return new Transaction().add({
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

  private randomDistribute(
    total: number,
    count: number,
    minAmount?: number,
    maxAmount?: number
  ): number[] {
    const amounts: number[] = [];
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

  private getRandomDelay(range?: [number, number]): number {
    const [min, max] = range || [this.MIN_DELAY_MS, this.MIN_DELAY_MS * 2];
    return min + Math.random() * (max - min);
  }

  async createSellTransaction(
    walletAddress: string,
    tokenMint: string,
    amount: number,
    targetPrice: number,
    slippage: number
  ): Promise<string> {
    try {
      const wallets = await this.walletManager.getWallets();
      const wallet = wallets.find(w => w.publicKey === walletAddress);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const transaction = new Transaction();
      
      // Add token program instructions for selling
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(tokenMint),
          lamports: amount
        })
      );

      const signature = await this.client.sendTransaction(
        wallet.privateKey,
        tokenMint,
        amount
      );
      
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
    } catch (error) {
      logger.error('Failed to create sell transaction:', error);
      throw error;
    }
  }

  async distributeTokens(
    walletCount: number,
    amount: number,
    options: DistributionOptions = {}
  ): Promise<void> {
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
        } else {
          await this.client.sendTransaction(
            process.env.FUNDER_PRIVATE_KEY || '',
            wallets[i].publicKey,
            amount
          );
        }
      }

      // ... rest of the code ...
    } catch (error) {
      logger.error('Distribute tokens error:', error);
      throw error;
    }
  }

  async getWalletBalance(walletAddress: string): Promise<number> {
    try {
      const wallets = await this.walletManager.getWallets();
      const wallet = wallets.find((w: WalletData) => w.publicKey === walletAddress);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const connection = await this.client.getActiveConnection();
      const balance = await connection.getBalance(new PublicKey(walletAddress));
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      throw error;
    }
  }
} 