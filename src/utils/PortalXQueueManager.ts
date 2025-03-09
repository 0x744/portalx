import { Transaction, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { PortalXBlockchainClient } from './PortalXBlockchainClient';
import { PortalXWalletManager, WalletData } from './PortalXWalletManager';
import { PortalXValidation } from './PortalXValidation';
import axios from 'axios';
import winston from 'winston';
import { Keypair } from '@solana/web3.js';
import { Logger } from 'winston';

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

interface Wallet {
  publicKey: string;
  privateKey: string;
}

// WARNING: Using testnet configuration
const TOKEN_MINT = "BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8SQWcC";

const targetPrice = 0.001;
const slippage = 0.01;

export class PortalXQueueManager {
  private client: PortalXBlockchainClient;
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;

  private readonly PUMPFUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
  private readonly MAX_BATCH_SIZE = 3;
  private readonly MIN_DELAY_MS = 1000;
  private readonly CHANGENOW_API_KEY = 'test-api-key';
  private transactionConfigs = new Map<string, TransactionConfig>();
  private readonly walletManager: PortalXWalletManager;
  private readonly TOKEN_MINT: PublicKey;
  private wallets: Wallet[] = [];
  private logger: Logger;

  constructor(
    client: PortalXBlockchainClient,
    tokenMint: string,
    logger: Logger
  ) {
    this.client = client;
    this.walletManager = new PortalXWalletManager();
    this.TOKEN_MINT = new PublicKey(tokenMint);
    this.logger = logger;
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
      // Validate transaction
      if (!item.tx) {
        throw new Error('Transaction is null or undefined');
      }
      
      if (!item.tx.instructions || item.tx.instructions.length === 0) {
        throw new Error('Transaction has no instructions');
      }
      
      if (!item.privateKey) {
        throw new Error('Private key is missing');
      }
      
      // Ensure transaction has recent blockhash
      const connection = await this.client.getActiveConnection();
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      item.tx.recentBlockhash = blockhash;
      
      // Add retry logic with exponential backoff
      let retries = item.config.maxRetries;
      let lastError: Error | null = null;
      
      while (retries > 0) {
        try {
          await this.client.sendCustomTransaction(
            item.tx,
            item.privateKey,
            retries
          );
          logger.info('Transaction processed successfully');
          return;
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            const backoff = Math.min(1000 * Math.pow(2, item.config.maxRetries - retries), 8000);
            logger.warn(`Transaction failed, retrying in ${backoff}ms. Retries left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, backoff));
          }
        }
      }
      
      throw lastError || new Error('Transaction failed after all retries');
    } catch (error) {
      logger.error('Transaction processing error:', error);
      if (item.config.maxRetries > 0) {
        item.config.maxRetries--;
        this.queue.push(item);
      }
      throw error;
    }
  }

  async bundleOnBondingCurve(totalSol: number, walletCount: number, minAmount: number, maxAmount: number): Promise<void> {
    try {
      // Input validation
      if (totalSol <= 0 || walletCount <= 0 || minAmount <= 0 || maxAmount <= 0) {
        throw new Error('Invalid input parameters');
      }

      // Generate new wallets if needed
      while (this.wallets.length < walletCount) {
        const wallet = Keypair.generate();
        this.wallets.push({
          publicKey: wallet.publicKey.toBase58(),
          privateKey: Buffer.from(wallet.secretKey).toString('base64')
        });
        this.logger.info(`Generated wallet: ${wallet.publicKey.toBase58()}`);
      }

      // Check wallet balances
      const connection = await this.client.getActiveConnection();
      for (const wallet of this.wallets) {
        const balance = await connection.getBalance(new PublicKey(wallet.publicKey));
        if (balance < 0.01 * LAMPORTS_PER_SOL) {
          this.logger.warn(`Wallet ${wallet.publicKey} has low balance: ${balance / LAMPORTS_PER_SOL} SOL`);
        }
      }

      // Fund wallets
      const funderKeypair = Keypair.fromSecretKey(Buffer.from(process.env.FUNDER_PRIVATE_KEY || '', 'base64'));
      const funderBalance = await connection.getBalance(funderKeypair.publicKey);
      
      if (funderBalance < totalSol * LAMPORTS_PER_SOL) {
        throw new Error(`Funder wallet has insufficient balance: ${funderBalance / LAMPORTS_PER_SOL} SOL`);
      }

      // Distribute funds randomly
      const remainingSol = totalSol;
      for (const wallet of this.wallets) {
        const amount = Math.random() * (maxAmount - minAmount) + minAmount;
        if (amount > remainingSol) continue;

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: funderKeypair.publicKey,
            toPubkey: new PublicKey(wallet.publicKey),
            lamports: amount * LAMPORTS_PER_SOL
          })
        );

        await this.addToQueue(transaction, Buffer.from(funderKeypair.secretKey).toString('base64'), 0);
        this.logger.info(`Added funding transaction to queue for wallet ${wallet.publicKey}`);

        // Add random delay between funding transactions
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      }

      // Create buy transactions for bonding curve
      for (const wallet of this.wallets) {
        const transaction = await this.createBuyTransaction(
          new PublicKey(wallet.publicKey),
          Math.random() * (maxAmount - minAmount) + minAmount
        );

        if (transaction) {
          await this.addToQueue(transaction, wallet.privateKey, 1);
          this.logger.info(`Added buy transaction to queue for wallet ${wallet.publicKey}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to bundle on bonding curve: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  private async createBuyTransaction(walletPubkey: PublicKey, amount: number): Promise<Transaction | null> {
    try {
      // Validate inputs
      if (!walletPubkey || amount <= 0) {
        throw new Error('Invalid input parameters');
      }

      // Get token info
      const tokenInfo = await this.client.getTokenInfo(this.TOKEN_MINT.toBase58());
      if (!tokenInfo) {
        throw new Error('Failed to get token info');
      }

      // Create transaction
      const transaction = new Transaction();
      
      // Add buy instruction
      transaction.add(
        // Add your buy instruction here based on the bonding curve implementation
        // This is a placeholder
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: this.TOKEN_MINT,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      return transaction;
    } catch (error) {
      this.logger.error(`Failed to create buy transaction: ${error.message}`, { stack: error.stack });
      return null;
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
          const sellTx = await this.createBondingCurveSellTx(
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

      logger.info(`ChangeNow transaction created: ${response.data.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`ChangeNow funding failed: ${errorMessage}`);
      throw error;
    }
  }

  private randomDistribute(total: number, count: number, min?: number, max?: number): number[] {
    const amounts: number[] = [];
    let remaining = total;

    for (let i = 0; i < count - 1; i++) {
      const minAmount = min || 0.001;
      const maxAmount = max || remaining / 2;
      const amount = Math.random() * (maxAmount - minAmount) + minAmount;
      amounts.push(amount);
      remaining -= amount;
    }

    amounts.push(remaining);
    return amounts;
  }

  private getRandomDelay(range?: [number, number]): number {
    const [min, max] = range || [this.MIN_DELAY_MS, this.MIN_DELAY_MS * 3];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async createBondingCurveSellTx(tokenMint: PublicKey, seller: PublicKey, receiver: PublicKey, percentage: number): Promise<Transaction> {
    const connection = await this.client.getActiveConnection();
    const sellerTokenAccount = await getAssociatedTokenAddress(tokenMint, seller);
    const receiverTokenAccount = await getAssociatedTokenAddress(tokenMint, receiver);
    
    // Get token balance
    const tokenBalance = await connection.getTokenAccountBalance(sellerTokenAccount);
    const amount = Math.floor(tokenBalance.value.uiAmount * percentage);
    
    const tx = new Transaction();
    
    // Add token transfer instruction
    tx.add(createTransferInstruction(
      sellerTokenAccount,
      receiverTokenAccount,
      seller,
      amount,
      [],
      TOKEN_PROGRAM_ID
    ));
    
    return tx;
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
      if (!TOKEN_MINT || TOKEN_MINT === "BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8SQWcC") {
        logger.warn('Using test token mint');
      }

      // Generate wallets if needed
      const wallets = await this.walletManager.getWallets();
      if (wallets.length < walletCount) {
        for (let i = 0; i < walletCount - wallets.length; i++) {
          await this.walletManager.addWallet(`Wallet ${wallets.length + i + 1}`);
        }
      }

      // Get funder wallet
      const funderWallet = await this.walletManager.getFunderWallet();
      if (!funderWallet) {
        throw new Error('Funder wallet not found');
      }

      // Fund wallets using ChangeNow or direct transfer
      for (let i = 0; i < wallets.length; i++) {
        if (options.useChangeNow && this.CHANGENOW_API_KEY) {
          await this.fundWithChangeNow(wallets[i].publicKey, amount);
        } else {
          await this.client.sendTransaction(
            funderWallet.privateKey,
            wallets[i].publicKey,
            amount
          );
        }

        // Add delay between transactions
        const delay = this.getRandomDelay(options.delayRange);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
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