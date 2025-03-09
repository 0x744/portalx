import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  Liquidity,
  Token,
  TokenAmount,
  Percent,
  LiquidityPoolKeys,
  SPL_ACCOUNT_LAYOUT,
  TOKEN_PROGRAM_ID,
} from '@raydium-io/raydium-sdk';
import { PortalXBlockchainClient } from './PortalXBlockchainClient';
import { PortalXWalletManager } from './PortalXWalletManager';
import winston from 'winston';

interface SwapConfig {
  inputMint: string;
  outputMint: string;
  amountIn: string; // Raw amount (not lamports)
  minAmountOut: string;
  poolId: string; // Pool address or identifier
}

interface SnipeConfig {
  jitoTipAmount: number; // In SOL, e.g., 0.005
  maxSlippage: number; // Percentage as decimal, e.g., 0.05 for 5%
  funderPrivateKey: string;
  bloxrouteEndpoint?: string;
  sendMode: 'hybrid' | 'jito' | 'bloxroute' | 'rpc';
  bundleMode?: 'mev' | 'stagger';
}

interface BundleConfig {
  devWallet: Keypair;
  mevWallet: Keypair;
  cleanWallets: Keypair[];
  amount: number;
  delayMs?: number;
}

export class PortalXTokenSniper {
  private client: PortalXBlockchainClient;
  private walletManager: PortalXWalletManager;
  private logger: winston.Logger;

  constructor(client: PortalXBlockchainClient) {
    this.client = client;
    this.walletManager = new PortalXWalletManager();
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
  }

  // Fetch pool keys using Raydium's fetchAllPoolKeys
  private async getPoolKeys(tokenMint: PublicKey): Promise<LiquidityPoolKeys> {
    const connection = await this.client.getActiveConnection();
    const allPoolKeys = await Liquidity.fetchAllPoolKeys(connection, {
      4: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
      5: new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
    });

    // Find the pool for the given token mint (assuming SOL as quote)
    const poolKeys = allPoolKeys.find(
      (pool) =>
        (pool.baseMint.equals(tokenMint) && pool.quoteMint.equals(new PublicKey('So11111111111111111111111111111111111111112'))) ||
        (pool.quoteMint.equals(tokenMint) && pool.baseMint.equals(new PublicKey('So11111111111111111111111111111111111111112')))
    );

    if (!poolKeys) {
      throw new Error(`No Raydium pool found for token ${tokenMint.toBase58()}`);
    }

    return poolKeys;
  }

  async safeSnipe(
    wallet: Keypair,
    tokenMint: PublicKey,
    amount: number,
    config: SnipeConfig
  ): Promise<string> {
    try {
      // Check MEV risk
      const mevRisk = await this.checkMEVRisk(tokenMint, amount);
      if (mevRisk) {
        throw new Error('MEV risk detected - transaction cancelled');
      }

      // Fetch pool keys based on token mint
      const poolKeys = await this.getPoolKeys(tokenMint);

      // Create swap configuration
      const swapConfig: SwapConfig = {
        inputMint: 'So11111111111111111111111111111111111111112', // SOL
        outputMint: tokenMint.toString(),
        amountIn: amount.toString(),
        minAmountOut: '0', // Adjust based on slippage tolerance
        poolId: poolKeys.id.toString(),
      };

      // Create and send transaction
      const tx = await this.createSwapTransaction(wallet, swapConfig, config);
      return await this.sendTransaction(tx, config);
    } catch (error) {
      this.logger.error('Safe snipe failed:', error);
      throw error;
    }
  }

  private async createSwapTransaction(
    wallet: Keypair,
    swapConfig: SwapConfig,
    config: SnipeConfig
  ): Promise<Transaction> {
    const tx = new Transaction();
    const connection = await this.client.getActiveConnection();

    // Add priority fee instruction
    tx.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.floor(config.jitoTipAmount * 1e6),
      })
    );

    // Define tokens
    const inputToken = new Token(
      new PublicKey(swapConfig.inputMint),
      new PublicKey('So11111111111111111111111111111111111111112'),
      9,
      'SOL',
      'Solana'
    );
    const outputToken = new Token(
      new PublicKey(swapConfig.outputMint),
      new PublicKey(swapConfig.outputMint),
      6,
      'TOKEN',
      'Token'
    );
    const amountIn = new TokenAmount(inputToken, swapConfig.amountIn, false);
    const amountOutMin = new TokenAmount(outputToken, swapConfig.minAmountOut, false);
    const slippage = new Percent(Math.floor(config.maxSlippage * 10000), 10000);

    // Fetch pool keys using the poolId from swapConfig
    const poolKeys = await this.getPoolKeys(new PublicKey(swapConfig.outputMint));

    // Fetch token accounts
    const accounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    const tokenAccounts = accounts.value.map((acc) => {
      const decoded = SPL_ACCOUNT_LAYOUT.decode(acc.account.data);
      return {
        pubkey: acc.pubkey,
        programId: TOKEN_PROGRAM_ID,
        accountInfo: {
          owner: wallet.publicKey,
          state: 1,
          mint: decoded.mint,
          amount: decoded.amount,
          delegateOption: 0,
          delegate: new PublicKey('11111111111111111111111111111111'),
          isNativeOption: 0,
          isNative: BigInt(0),
          delegatedAmount: BigInt(0),
          closeAuthorityOption: 0,
          closeAuthority: new PublicKey('11111111111111111111111111111111'),
        },
      };
    });

    const inputAccount = tokenAccounts.find((acc) => acc.accountInfo.mint.equals(inputToken.mint));
    const outputAccount = tokenAccounts.find((acc) => acc.accountInfo.mint.equals(outputToken.mint));

    if (!inputAccount || !outputAccount) {
      throw new Error('Required token accounts not found');
    }

    // Create swap instruction
    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection,
      poolKeys,
      userKeys: {
        owner: wallet.publicKey,
        payer: wallet.publicKey,
        tokenAccounts,
      },
      amountIn,
      amountOut: amountOutMin,
      fixedSide: 'in',
      makeTxVersion: 0,
    });

    // Add swap instructions to transaction
    innerTransactions.forEach((innerTx) => {
      tx.add(...innerTx.instructions);
    });

    return tx;
  }

  private async getMarketData(tokenMint: PublicKey): Promise<{
    poolId: string;
    price: number;
    priceImpact: number;
  }> {
    try {
      const poolKeys = await this.getPoolKeys(tokenMint);
      return {
        poolId: poolKeys.id.toString(),
        price: 0, // Placeholder; implement actual price fetch
        priceImpact: 0, // Placeholder; implement actual impact calculation
      };
    } catch (error) {
      this.logger.error('Failed to get market data:', error);
      throw error;
    }
  }

  private async checkMEVRisk(tokenMint: PublicKey, amount: number): Promise<boolean> {
    try {
      const connection = await this.client.getActiveConnection();
      const pendingTxs = await connection.getRecentPerformanceSamples(1);
      const hasLargePendingTx = pendingTxs.some(
        (sample) => sample.numTransactions > 1000 && sample.samplePeriodSecs < 1
      );

      const priceHistory = await this.getPriceHistory(tokenMint);
      const hasPriceManipulation = this.detectPriceManipulation(priceHistory);

      return hasLargePendingTx || hasPriceManipulation;
    } catch (error) {
      this.logger.error('MEV risk check failed:', error);
      return true; // Fail-safe
    }
  }

  private async getPriceHistory(tokenMint: PublicKey): Promise<number[]> {
    // Placeholder; implement actual price history fetch
    return [1, 1.1, 1.05]; // Example data
  }

  private detectPriceManipulation(priceHistory: number[]): boolean {
    if (priceHistory.length < 3) return false;
    const recentPrices = priceHistory.slice(-3);
    const priceChange = Math.abs(recentPrices[2] - recentPrices[0]);
    const averagePrice = recentPrices.reduce((a, b) => a + b) / 3;
    return priceChange > averagePrice * 0.1; // 10% threshold
  }

  private async sendTransaction(tx: Transaction, config: SnipeConfig): Promise<string> {
    const connection = await this.client.getActiveConnection();
    const funder = Keypair.fromSecretKey(Buffer.from(config.funderPrivateKey, 'base64'));

    switch (config.sendMode) {
      case 'hybrid':
        try {
          return await connection.sendTransaction(tx, [funder], { skipPreflight: true });
        } catch {
          return await connection.sendTransaction(tx, [funder], { skipPreflight: true });
        }
      case 'jito':
        return await connection.sendTransaction(tx, [funder], { skipPreflight: true });
      case 'bloxroute':
        if (!config.bloxrouteEndpoint) throw new Error('Bloxroute endpoint required');
        const response = await fetch(config.bloxrouteEndpoint, {
          method: 'POST',
          body: tx.serialize(),
        });
        return await response.text();
      case 'rpc':
        return await connection.sendTransaction(tx, [funder], { skipPreflight: true });
      default:
        throw new Error('Invalid send mode');
    }
  }

  async mevBundleSnipe(
    tokenMint: PublicKey,
    config: SnipeConfig,
    bundleConfig: BundleConfig
  ): Promise<string[]> {
    try {
      if (bundleConfig.cleanWallets.length < 20) {
        throw new Error('Need 20 clean wallets for MEV bundle');
      }

      // Step 1: Bundle dev and MEV wallet buys in one tx
      const mevTx = new Transaction();
      const devBuyIx = await this.createSwapTransaction(bundleConfig.devWallet, {
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: tokenMint.toString(),
        amountIn: bundleConfig.amount.toString(),
        minAmountOut: '0',
        poolId: (await this.getPoolKeys(tokenMint)).id.toString(),
      }, config);
      const mevBuyIx = await this.createSwapTransaction(bundleConfig.mevWallet, {
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: tokenMint.toString(),
        amountIn: bundleConfig.amount.toString(),
        minAmountOut: '0',
        poolId: (await this.getPoolKeys(tokenMint)).id.toString(),
      }, config);
      mevTx.add(...mevBuyIx.instructions);

      // Send via Jito for same-block execution
      const mevSig = await this.sendTransaction(mevTx, { ...config, sendMode: 'jito' });

      // Step 2: Dump from MEV wallet (block 1 or 2)
      const dumpTx = await this.createSellTransaction(bundleConfig.mevWallet, tokenMint, config);
      const dumpSig = await this.sendTransaction(dumpTx, config);

      // Step 3: 20 clean wallets buy across blocks 1-2
      const cleanTxs = await Promise.all(
        bundleConfig.cleanWallets.slice(0, 20).map(async (wallet, i) => {
          const delay = i % 2 === 0 ? 0 : 5000; // Split across 2 blocks
          await new Promise(resolve => setTimeout(resolve, delay));
          const buyTx = await this.createSwapTransaction(wallet, {
            inputMint: 'So11111111111111111111111111111111111111112',
            outputMint: tokenMint.toString(),
            amountIn: (bundleConfig.amount / 20).toString(),
            minAmountOut: '0',
            poolId: (await this.getPoolKeys(tokenMint)).id.toString(),
          }, config);
          return this.sendTransaction(buyTx, config);
        })
      );

      return [mevSig, dumpSig, ...cleanTxs];
    } catch (error) {
      this.logger.error('MEV bundle snipe failed:', error);
      throw error;
    }
  }

  async staggerBundleSnipe(
    tokenMint: PublicKey,
    config: SnipeConfig,
    wallets: Keypair[],
    amount: number,
    delayMs: number = 100
  ): Promise<string[]> {
    try {
      const signatures: string[] = [];
      
      // Send individual buy txs with slight delays
      for (const wallet of wallets) {
        const buyTx = await this.createSwapTransaction(wallet, {
          inputMint: 'So11111111111111111111111111111111111111112',
          outputMint: tokenMint.toString(),
          amountIn: amount.toString(),
          minAmountOut: '0',
          poolId: (await this.getPoolKeys(tokenMint)).id.toString(),
        }, config);
        
        const sig = await this.sendTransaction(buyTx, config);
        signatures.push(sig);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      return signatures;
    } catch (error) {
      this.logger.error('Stagger bundle snipe failed:', error);
      throw error;
    }
  }

  private async createSellTransaction(
    wallet: Keypair,
    tokenMint: PublicKey,
    config: SnipeConfig
  ): Promise<Transaction> {
    const poolKeys = await this.getPoolKeys(tokenMint);
    const token = new Token(
      tokenMint,
      tokenMint,
      6,
      'TOKEN',
      'Token'
    );
    
    // Get token balance
    const connection = await this.client.getActiveConnection();
    const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    const tokenAccount = accounts.value.find(acc => 
      acc.account.data.parsed.info.mint === tokenMint.toString()
    );
    
    if (!tokenAccount) {
      throw new Error('Token account not found');
    }

    const amount = new TokenAmount(token, tokenAccount.account.data.parsed.info.tokenAmount.amount, false);
    
    return await this.createSwapTransaction(wallet, {
      inputMint: tokenMint.toString(),
      outputMint: 'So11111111111111111111111111111111111111112',
      amountIn: amount.toFixed(),
      minAmountOut: '0',
      poolId: poolKeys.id.toString(),
    }, config);
  }
} 