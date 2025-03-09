import { PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

export const TEST_CONFIG = {
  // Devnet RPC URLs
  RPC_URLS: [
    'https://api.devnet.solana.com',
    'https://devnet.rpcpool.com',
    'https://devnet.helius-rpc.com/?api-key=test'
  ],

  // Test token mint (SOL/SRM pair on Devnet)
  TEST_TOKEN_MINT: new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
  
  // Funder wallet for testing
  TEST_FUNDER_KEY: process.env.FUNDER_PRIVATE_KEY || '',
  
  // Test amounts
  TEST_AMOUNTS: {
    SMALL: 0.1,    // 0.1 SOL
    MEDIUM: 0.5,   // 0.5 SOL
    LARGE: 1.0     // 1.0 SOL
  },

  // Test delays
  DELAYS: {
    SHORT: 100,    // 100ms
    MEDIUM: 500,   // 500ms
    LONG: 1000     // 1000ms
  },

  // Test wallet counts
  WALLET_COUNTS: {
    MIN: 5,
    MEDIUM: 10,
    MAX: 22  // Adjusted for MEV Bundle (1 dev + 1 MEV + 20 clean)
  },

  // Test slippage values
  SLIPPAGE: {
    LOW: 0.01,     // 1%
    MEDIUM: 0.05,  // 5%
    HIGH: 0.10     // 10%
  },

  // Test tip amounts
  TIPS: {
    LOW: 0.001,    // 0.001 SOL
    MEDIUM: 0.005, // 0.005 SOL
    HIGH: 0.01     // 0.01 SOL
  },

  // Test timeouts
  TIMEOUTS: {
    SHORT: 5000,   // 5s
    MEDIUM: 10000, // 10s
    LONG: 30000    // 30s
  },

  // Test retries
  RETRIES: {
    MIN: 1,
    MEDIUM: 3,
    MAX: 5
  }
};

export interface TestDetails {
  [key: string]: any;
  expectedError?: string;
  txSignature?: string;
  walletAddress?: string;
  tokenAmount?: number;
  price?: number;
}

export interface TestResult {
  feature: string;
  test: string;
  status: 'success' | 'failure';
  error?: string;
  duration: number;
  timestamp: string;
  details: TestDetails;
}

export interface TestReport {
  results: TestResult[];
  startTime: string;
  endTime: string;
  totalDuration: number;
  totalTests: number;
  successCount: number;
  failureCount: number;
  environment?: {
    rpcUrl: string;
    tokenMint: string;
    funderBalance?: number;
  };
}

export interface TestSuite {
  name: string;
  tests: Test[];
  setup?: () => Promise<any>;
  teardown?: () => Promise<void>;
}

export interface Test {
  name: string;
  description?: string;
  skip?: boolean;
  run: (setupData?: any) => Promise<TestDetails>;
} 