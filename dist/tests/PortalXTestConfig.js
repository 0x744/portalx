"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_CONFIG = void 0;
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.TEST_CONFIG = {
    // Devnet RPC URLs
    RPC_URLS: [
        'https://api.devnet.solana.com',
        'https://devnet.rpcpool.com',
        'https://devnet.helius-rpc.com/?api-key=test'
    ],
    // Test token mint (SOL/SRM pair on Devnet)
    TEST_TOKEN_MINT: new web3_js_1.PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
    // Funder wallet for testing
    TEST_FUNDER_KEY: process.env.FUNDER_PRIVATE_KEY || '',
    // Test amounts
    TEST_AMOUNTS: {
        SMALL: 0.1, // 0.1 SOL
        MEDIUM: 0.5, // 0.5 SOL
        LARGE: 1.0 // 1.0 SOL
    },
    // Test delays
    DELAYS: {
        SHORT: 100, // 100ms
        MEDIUM: 500, // 500ms
        LONG: 1000 // 1000ms
    },
    // Test wallet counts
    WALLET_COUNTS: {
        MIN: 5,
        MEDIUM: 10,
        MAX: 22 // Adjusted for MEV Bundle (1 dev + 1 MEV + 20 clean)
    },
    // Test slippage values
    SLIPPAGE: {
        LOW: 0.01, // 1%
        MEDIUM: 0.05, // 5%
        HIGH: 0.10 // 10%
    },
    // Test tip amounts
    TIPS: {
        LOW: 0.001, // 0.001 SOL
        MEDIUM: 0.005, // 0.005 SOL
        HIGH: 0.01 // 0.01 SOL
    },
    // Test timeouts
    TIMEOUTS: {
        SHORT: 5000, // 5s
        MEDIUM: 10000, // 10s
        LONG: 30000 // 30s
    },
    // Test retries
    RETRIES: {
        MIN: 1,
        MEDIUM: 3,
        MAX: 5
    }
};
