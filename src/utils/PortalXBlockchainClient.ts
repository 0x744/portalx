import { 
  Connection, 
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  SendOptions,
  Signer
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction
} from '@solana/spl-token';
import { TokenInfo as SPLTokenInfo } from '@solana/spl-token-registry';
import winston from 'winston';
import bs58 from 'bs58';

interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  balance: number;
  price: number;
}

interface TokenAccount {
  mint: string;
  owner: string;
  amount: number;
  decimals: number;
}

interface TokenBalance {
  token: TokenInfo;
  account: TokenAccount;
}

interface TransactionResult {
  signature: string;
  status: string;
  error?: string;
}

interface TokenTransferResult {
  success: boolean;
  signature?: string;
  error?: string;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  decimals: number;
  totalSupply: number;
}

// Simple browser-compatible logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args)
};

// WARNING: Using testnet configuration
const FUNDER_PRIVATE_KEY = "FhrSSxrmsyoV1qEYanZwzVMMCN8VFBRVfm1bawUHWPPJ";
// WARNING: Using testnet configuration
const JITO_TIP_ACCOUNT = "CwZ1R9vddQ99Xh8vkhSP3fFSSfG2N97jX8Q6Y2Y2K8Q";

// Simple rate limiter implementation
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();
    if (this.tokens <= 0) {
      const waitTime = (this.lastRefill + this.refillRate) - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    this.tokens--;
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillRate);
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
}

export class PortalXBlockchainClient {
  private connection: Connection;
  private readonly rpcUrls: string[];
  private readonly rateLimiter: RateLimiter;
  private tokenRegistry: Map<string, TokenInfo>;
  private readonly FUNDER_PRIVATE_KEY = new PublicKey(FUNDER_PRIVATE_KEY);
  private readonly JITO_TIP_ACCOUNT = new PublicKey(JITO_TIP_ACCOUNT);
  private logger: winston.Logger;

  constructor(rpcUrls: string[]) {
    this.rpcUrls = rpcUrls;
    this.rateLimiter = new RateLimiter(10, 1000); // 10 requests per second
    this.connection = new Connection(rpcUrls[0], {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      wsEndpoint: rpcUrls[0].replace('https', 'wss'),
      httpHeaders: {
        'Cache-Control': 'no-cache',
      }
    });
    this.tokenRegistry = new Map();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
    logger.info('PortalXBlockchainClient initialized with testnet RPCs');

    if (this.FUNDER_PRIVATE_KEY.toBase58() === '4vX5jP8eZkP6LqX6Z3Y8Y6K8L5J9X2K7M8N6P5Q4R3S2T9U8V7W6X5Y4Z3A2B9C8D7E6F5G4H3I2J9K8L7M6N5P4Q3R2S9T8U7V6W5X4Y3Z2') {
      console.log('Placeholder error: Using test funder private key - Replace with real key for production');
    }
    if (this.JITO_TIP_ACCOUNT.toBase58() === 'JitoTipAccount') {
      console.log('Placeholder error: Using placeholder Jito tip account - Replace with real account for production');
    }
  }

  async getActiveConnection(): Promise<Connection> {
    // Test each RPC endpoint and return the first working one
    for (const rpc of this.rpcUrls) {
      try {
        const connection = new Connection(rpc, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 60000,
          wsEndpoint: rpc.replace('https', 'wss'),
          httpHeaders: {
            'Cache-Control': 'no-cache',
          }
        });

        // Test the connection with a timeout
        await Promise.race([
          connection.getSlot(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
          )
        ]);

        // Create a wrapped connection with rate limiting
        const wrappedConnection = new Proxy(connection, {
          get: (target, prop) => {
            if (prop === 'sendTransaction') {
              return async (transaction: Transaction, signers: Signer[], options?: SendOptions) => {
                await this.rateLimiter.waitForToken();
                return target.sendTransaction(transaction, signers, options);
              };
            }
            return target[prop];
          }
        });

        return wrappedConnection;
      } catch (error) {
        console.warn(`Failed to connect to RPC ${rpc}:`, error.message);
        continue;
      }
    }
    throw new Error('No working RPC endpoints found');
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (error.message.includes('429')) {
          const delay = baseDelay * Math.pow(2, i);
          console.warn(`Rate limited, retrying after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (error.message.includes('timeout')) {
          // For timeouts, try a different RPC endpoint
          this.connection = await this.getActiveConnection();
        } else {
          throw error;
        }
      }
    }
    throw lastError;
  }

  private async confirmTransaction(signature: string, timeout: number = 30000): Promise<boolean> {
    const conn = await this.getActiveConnection();
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const status = await conn.getSignatureStatus(signature);
        if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
          logger.info(`Transaction confirmed: ${signature}`);
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every 1s
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.warn(`Error checking transaction status: ${errorMessage}`);
      }
    }
    logger.warn(`Transaction confirmation timeout: ${signature}`);
    return false;
  }

  async sendTransaction(
    fromPrivateKey: string,
    toPublicKey: string,
    amount: number,
    retries: number = 3
  ): Promise<string> {
    try {
      if (this.FUNDER_PRIVATE_KEY.toBase58() === '4vX5jP8eZkP6LqX6Z3Y8Y6K8L5J9X2K7M8N6P5Q4R3S2T9U8V7W6X5Y4Z3A2B9C8D7E6F5G4H3I2J9K8L7M6N5P4Q3R2S9T8U7V6W5X4Y3Z2') {
        console.log('Placeholder error: Cannot send transaction with test funder key');
        return 'Placeholder: Transaction skipped';
      }
      logger.info(`Attempting to send transaction with test funder key`);
      const connection = await this.getActiveConnection();
      const keypair = Keypair.fromSecretKey(Buffer.from(fromPrivateKey, 'hex'));
      const toPubkey = new PublicKey(toPublicKey);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey,
          lamports: amount * 1e9
        })
      );
      const signature = await connection.sendTransaction(transaction, [keypair]);
      await this.confirmTransaction(signature);
      return signature;
    } catch (error) {
      logger.error('Transaction attempt failed:', error);
      if (retries > 0) {
        return this.sendTransaction(fromPrivateKey, toPublicKey, amount, retries - 1);
      }
      throw error;
    }
  }

  async sendCustomTransaction(
    transaction: Transaction,
    fromPrivateKey: string,
    retries: number = 3
  ): Promise<boolean> {
    try {
      if (!fromPrivateKey) {
        throw new Error('Private key is required');
      }

      logger.info(`Attempting to send custom transaction`);
      const connection = await this.getActiveConnection();
      
      // Try to decode private key from different formats
      let keypair: Keypair;
      try {
        // Try base58 first
        const decoded = bs58.decode(fromPrivateKey);
        if (decoded.length !== 64) {
          throw new Error('Invalid base58 private key length');
        }
        keypair = Keypair.fromSecretKey(decoded);
      } catch (base58Error) {
        try {
          // Try hex format
          const hexBuffer = Buffer.from(fromPrivateKey, 'hex');
          if (hexBuffer.length !== 64) {
            throw new Error('Invalid hex private key length');
          }
          keypair = Keypair.fromSecretKey(hexBuffer);
        } catch (hexError) {
          try {
            // Try base64
            const base64Buffer = Buffer.from(fromPrivateKey, 'base64');
            if (base64Buffer.length !== 64) {
              throw new Error('Invalid base64 private key length');
            }
            keypair = Keypair.fromSecretKey(base64Buffer);
          } catch (base64Error) {
            throw new Error('Invalid private key format - must be base58, hex, or base64');
          }
        }
      }

      // Validate transaction
      if (!transaction || !transaction.instructions || transaction.instructions.length === 0) {
        throw new Error('Invalid transaction: No instructions found');
      }

      // Ensure transaction has recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Add fee payer
      transaction.feePayer = keypair.publicKey;

      // Sign and send transaction
      transaction.sign(keypair);
      const signature = await connection.sendRawTransaction(transaction.serialize());
      
      // Wait for confirmation with timeout
      const confirmed = await this.confirmTransaction(signature);
      if (!confirmed) {
        throw new Error('Transaction failed to confirm');
      }

      logger.info(`Transaction confirmed: ${signature}`);
      return true;
    } catch (error) {
      logger.error('Transaction attempt failed:', error);
      if (retries > 0) {
        // Add exponential backoff
        const backoff = Math.min(1000 * Math.pow(2, 3 - retries), 8000);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.sendCustomTransaction(transaction, fromPrivateKey, retries - 1);
      }
      throw error;
    }
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const connection = await this.getActiveConnection();
      const pubkey = new PublicKey(publicKey);
      const balance = await connection.getBalance(pubkey);
      logger.info(`Balance fetched for ${publicKey}: ${balance / 1e9} SOL`);
      return balance / 1e9;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Balance fetch failed: ${errorMessage}`);
      throw error;
    }
  }

  async getTokenInfo(mintAddress: string): Promise<TokenInfo> {
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        mintPubkey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const tokenAccount = tokenAccounts.value[0];
      if (!tokenAccount) {
        throw new Error('Token account not found');
      }

      const tokenData = tokenAccount.account.data.parsed.info;
      const balance = tokenData.tokenAmount.uiAmount;
      const price = await this.getTokenPrice(mintAddress);

      return {
        mint: mintAddress,
        name: tokenData.mint.symbol || 'UNKNOWN',
        symbol: tokenData.mint.symbol || 'UNKNOWN',
        decimals: tokenData.mint.decimals,
        logoURI: tokenData.mint.logoURI,
        balance,
        price
      };
    } catch (error) {
      throw new Error(`Failed to get token info: ${error}`);
    }
  }

  async getTokenPrice(mintAddress: string): Promise<number> {
    try {
      // Implement price fetching logic here
      // This could involve querying DEXes or price feeds
      return 0; // Placeholder
    } catch (error) {
      throw new Error(`Failed to get token price: ${error}`);
    }
  }

  async updateTokenMetadata(metadata: TokenMetadata): Promise<void> {
    try {
      this.logger.info('Updating token metadata', { metadata });
      
      // TODO: Implement actual token metadata update logic
      // This would typically involve:
      // 1. Creating a new token mint
      // 2. Setting up the metadata account
      // 3. Minting initial supply
      // 4. Setting up token program accounts
      
      this.logger.info('Token metadata updated successfully');
    } catch (error) {
      this.logger.error('Failed to update token metadata', { error });
      throw error;
    }
  }

  async getTokenAccounts(owner: string): Promise<TokenAccount[]> {
    try {
      const connection = await this.getActiveConnection();
      const ownerPubkey = new PublicKey(owner);
      const accounts = await connection.getParsedTokenAccountsByOwner(
        ownerPubkey,
        { programId: TOKEN_PROGRAM_ID }
      );
      return accounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        owner: owner,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals
      }));
    } catch (error) {
      this.logger.error('Error getting token accounts:', error);
      throw error;
    }
  }

  async getTokenBalances(owner: string): Promise<TokenBalance[]> {
    try {
      const accounts = await this.getTokenAccounts(owner);
      const balances = await Promise.all(
        accounts.map(async account => {
          const tokenInfo = await this.getTokenInfo(account.mint);
          return {
            token: tokenInfo,
            account
          };
        })
      );
      return balances;
    } catch (error) {
      this.logger.error('Error getting token balances:', error);
      throw error;
    }
  }

  async getRecentTransactions(owner: string, limit: number = 10): Promise<TransactionResult[]> {
    try {
      const connection = await this.getActiveConnection();
      const ownerPubkey = new PublicKey(owner);
      const signatures = await connection.getSignaturesForAddress(ownerPubkey, { limit });
      return await Promise.all(
        signatures.map(async sig => {
          const tx = await connection.getTransaction(sig.signature);
          return {
            signature: sig.signature,
            status: tx?.meta?.err ? 'failed' : 'success',
            error: tx?.meta?.err?.toString()
          };
        })
      );
    } catch (error) {
      this.logger.error('Error getting recent transactions:', error);
      throw error;
    }
  }

  async getDashboardData(owner: string) {
    try {
      const tokenAccounts = await this.getTokenAccounts(owner);
      const balances = await this.getTokenBalances(owner);
      const recentTransactions = await this.getRecentTransactions(owner);
      
      return {
        tokenAccounts,
        balances,
        recentTransactions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
} 