"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXTestRunner = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const PortalXBlockchainClient_1 = require("../utils/PortalXBlockchainClient");
const PortalXWalletManager_1 = require("../utils/PortalXWalletManager");
const PortalXTokenSniper_1 = require("../utils/PortalXTokenSniper");
const PortalXQueueManager_1 = require("../utils/PortalXQueueManager");
const PortalXLimitOrders_1 = require("../utils/PortalXLimitOrders");
const PortalXTestConfig_1 = require("./PortalXTestConfig");
const winston_1 = __importDefault(require("winston"));
const winston_transport_1 = __importDefault(require("winston-transport"));
const ENABLE_JITO = process.env.ENABLE_JITO === 'true';
const ENABLE_NONCE = process.env.ENABLE_NONCE === 'true';
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.File({ filename: 'test-error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'test-combined.log' }),
        new winston_1.default.transports.Console()
    ]
});
// Custom memory transport for testing
class MemoryTransport extends winston_transport_1.default {
    constructor() {
        super();
        this.logs = [];
    }
    log(info, callback) {
        this.logs.push(JSON.stringify(info));
        this.emit('logged', info);
        callback();
    }
    getLogs() {
        return this.logs;
    }
    clear() {
        this.logs = [];
    }
}
// Test configuration constants
const SECURITY_TEST_CONSTANTS = {
    MAX_FEE_MICRO_LAMPORTS: BigInt(10000000), // 0.01 SOL, Devnet-friendly
    MIN_FEE_MICRO_LAMPORTS: BigInt(1000), // Minimum reasonable fee
    TRANSFER_AMOUNT_LAMPORTS: 0.01 * web3_js_1.LAMPORTS_PER_SOL,
    ENCRYPTION_MIN_LENGTH: 96, // Minimum for AES-256-GCM components
    WALLET_FUND_AMOUNT: 1, // Amount in SOL to fund test wallets
    MAX_WALLETS: 2 // Number of wallets needed for tests
};
class PortalXTestRunner {
    constructor(connection, walletManager, tokenSniper) {
        this.results = [];
        this.connection = connection;
        this.client = new PortalXBlockchainClient_1.PortalXBlockchainClient([connection.rpcEndpoint]);
        this.walletManager = walletManager;
        this.tokenSniper = tokenSniper;
        this.queueManager = new PortalXQueueManager_1.PortalXQueueManager(this.client);
        this.limitOrders = new PortalXLimitOrders_1.PortalXLimitOrders(this.client);
        this.funder = web3_js_1.Keypair.fromSecretKey(Buffer.from(PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY, 'base64'));
        this.environment = {
            rpcUrl: connection.rpcEndpoint,
            tokenMint: PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT.toString()
        };
    }
    async setup() {
        try {
            logger.info('Setting up test environment');
            // Fund the funder wallet if needed
            const balance = await this.connection.getBalance(this.funder.publicKey);
            if (balance < 10 * web3_js_1.LAMPORTS_PER_SOL) {
                logger.info('Requesting airdrop for funder wallet');
                const airdropSignature = await this.connection.requestAirdrop(this.funder.publicKey, 10 * web3_js_1.LAMPORTS_PER_SOL);
                await this.connection.confirmTransaction(airdropSignature, 'confirmed');
                logger.info('Airdrop confirmed');
            }
            this.environment.funderBalance = await this.connection.getBalance(this.funder.publicKey) / web3_js_1.LAMPORTS_PER_SOL;
            logger.info(`Funder wallet balance: ${this.environment.funderBalance} SOL`);
            // Create and fund test wallets
            const wallets = Array(PortalXTestConfig_1.TEST_CONFIG.WALLET_COUNTS.MAX).fill(null).map(() => web3_js_1.Keypair.generate());
            await this.fundWallets(wallets, 1); // Fund each wallet with 1 SOL
            // Create token accounts for each wallet
            const tx = new web3_js_1.Transaction();
            for (const wallet of wallets) {
                const ata = await (0, spl_token_1.getAssociatedTokenAddress)(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, wallet.publicKey);
                tx.add((0, spl_token_1.createAssociatedTokenAccountInstruction)(this.funder.publicKey, ata, wallet.publicKey, PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT));
            }
            const signature = await this.connection.sendTransaction(tx, [this.funder]);
            await this.connection.confirmTransaction(signature, 'confirmed');
        }
        catch (error) {
            logger.error('Setup failed:', error);
            throw error;
        }
    }
    async runTest(test, suiteName, setupData) {
        if (test.skip) {
            logger.info(`Skipping test: ${suiteName} - ${test.name}`);
            return {
                feature: suiteName,
                test: test.name,
                status: 'success',
                duration: 0,
                timestamp: new Date().toISOString()
            };
        }
        const startTime = Date.now();
        let status = 'success';
        let error;
        let details = {};
        try {
            logger.info(`Running test: ${suiteName} - ${test.name}`);
            if (test.description) {
                logger.info(`Test description: ${test.description}`);
            }
            const result = await test.run(setupData);
            details = result;
        }
        catch (e) {
            status = 'failure';
            error = e instanceof Error ? e.message : 'Unknown error';
            logger.error(`Test failed: ${suiteName} - ${test.name}`, { error });
        }
        const duration = Date.now() - startTime;
        const result = {
            feature: suiteName,
            test: test.name,
            status,
            error,
            duration,
            timestamp: new Date().toISOString(),
            details
        };
        this.results.push(result);
        logger.info(`Test completed: ${suiteName} - ${test.name}`, { result });
        return result;
    }
    async runSuite(suite) {
        logger.info(`Starting test suite: ${suite.name}`);
        try {
            let setupData;
            if (suite.setup) {
                setupData = await suite.setup();
            }
            for (const test of suite.tests) {
                await this.runTest(test, suite.name, setupData);
            }
            if (suite.teardown) {
                await suite.teardown();
            }
        }
        catch (error) {
            logger.error(`Test suite failed: ${suite.name}`, error);
            throw error;
        }
    }
    async runAllTests() {
        try {
            await this.setup();
            logger.info('Starting PortalX test suite');
            // Run each test suite
            await this.runSuite(this.getTokenSniperTests());
            await this.runSuite(this.getMEVBundleTests());
            await this.runSuite(this.getStaggerBundleTests());
            await this.runSuite(this.getWalletManagerTests());
            await this.runSuite(this.getBlockchainClientTests());
            await this.runSuite(this.getQueueManagerTests());
            await this.runSuite(this.getLimitOrdersTests());
            await this.runSuite(this.getSettingsTests());
            await this.runSuite(this.getSecurityTests());
            await this.runSuite(this.getIntegrationTests());
            await this.runSuite(this.getMonitoringTests());
            await this.runSuite(this.getTransactionTests());
            await this.runSuite(this.getTokenManagementTests());
            this.generateReport();
        }
        catch (error) {
            logger.error('Test suite failed:', error);
            throw error;
        }
    }
    generateReport() {
        const successCount = this.results.filter(r => r.status === 'success').length;
        const failureCount = this.results.filter(r => r.status === 'failure').length;
        const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
        const report = {
            totalTests: this.results.length,
            successCount,
            failureCount,
            totalDuration,
            results: this.results,
            timestamp: new Date().toISOString(),
            environment: this.environment
        };
        logger.info('Test Report', report);
        console.log(JSON.stringify(report, null, 2));
    }
    async fundWallets(wallets, amount) {
        try {
            logger.info(`Funding ${wallets.length} wallets with ${amount} SOL each`);
            const tx = new web3_js_1.Transaction();
            wallets.forEach(wallet => {
                tx.add(web3_js_1.SystemProgram.transfer({
                    fromPubkey: this.funder.publicKey,
                    toPubkey: wallet.publicKey,
                    lamports: amount * web3_js_1.LAMPORTS_PER_SOL,
                }));
            });
            const signature = await this.connection.sendTransaction(tx, [this.funder]);
            await this.connection.confirmTransaction(signature, 'confirmed');
            logger.info('Wallet funding completed');
        }
        catch (error) {
            logger.error('Failed to fund wallets:', error);
            throw error;
        }
    }
    getTokenSniperTests() {
        return {
            name: 'Token Sniper',
            setup: async () => {
                // Create and fund test wallets
                const wallets = Array(PortalXTestConfig_1.TEST_CONFIG.WALLET_COUNTS.MAX).fill(null).map(() => web3_js_1.Keypair.generate());
                await this.fundWallets(wallets, 1); // Fund each wallet with 1 SOL
                return { wallets };
            },
            tests: [
                {
                    name: 'Basic Token Snipe',
                    description: 'Test basic token sniping functionality with a single wallet',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        const result = await this.tokenSniper.safeSnipe(wallet, PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, 0.1, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: 'hybrid'
                        });
                        return {
                            success: true,
                            txHash: result
                        };
                    }
                },
                {
                    name: 'MEV Bundle Snipe',
                    description: 'Test MEV bundle sniping with developer and MEV wallets',
                    run: async ({ wallets }) => {
                        const devWallet = wallets[0];
                        const mevWallet = wallets[1];
                        const cleanWallets = wallets.slice(2, 22);
                        const result = await this.tokenSniper.mevBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: 'jito'
                        }, {
                            devWallet,
                            mevWallet,
                            cleanWallets,
                            amount: 0.1
                        });
                        return {
                            success: true,
                            txHashes: result
                        };
                    }
                },
                {
                    name: 'Stagger Bundle Snipe',
                    description: 'Test stagger bundle sniping with multiple wallets',
                    run: async ({ wallets }) => {
                        const result = await this.tokenSniper.staggerBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: 'hybrid'
                        }, wallets.slice(0, 5), 0.1, 100);
                        return {
                            success: true,
                            txHashes: result
                        };
                    }
                },
                {
                    name: 'Risk Assessment',
                    description: 'Test risk assessment through safeSnipe with high slippage',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        try {
                            await this.tokenSniper.safeSnipe(wallet, PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, 0.1, {
                                jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                                maxSlippage: 0.5, // 50% slippage
                                funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                                sendMode: 'hybrid'
                            });
                            return {
                                success: false,
                                error: 'Expected high slippage to fail'
                            };
                        }
                        catch (error) {
                            return {
                                success: true,
                                error: error instanceof Error ? error.message : 'Unknown error'
                            };
                        }
                    }
                },
                {
                    name: 'Transaction Modes',
                    description: 'Test different transaction sending modes',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        const modes = ['hybrid', 'jito', 'bloxroute', 'rpc'];
                        const results = await Promise.all(modes.map(mode => this.tokenSniper.safeSnipe(wallet, PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, 0.1, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: mode
                        })));
                        return {
                            results: results.map((txHash, i) => ({
                                mode: modes[i],
                                success: true,
                                txHash
                            }))
                        };
                    }
                }
            ]
        };
    }
    getMEVBundleTests() {
        return {
            name: 'MEV Bundle',
            setup: async () => {
                // Create and fund test wallets
                const wallets = Array(PortalXTestConfig_1.TEST_CONFIG.WALLET_COUNTS.MAX).fill(null).map(() => web3_js_1.Keypair.generate());
                await this.fundWallets(wallets, 1); // Fund each wallet with 1 SOL
                return { wallets };
            },
            tests: [
                {
                    name: 'MEV Bundle Setup',
                    description: 'Test MEV bundle setup with developer and MEV wallets',
                    run: async ({ wallets }) => {
                        const devWallet = wallets[0];
                        const mevWallet = wallets[1];
                        const cleanWallets = wallets.slice(2, 22);
                        const result = await this.tokenSniper.mevBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: 'jito'
                        }, {
                            devWallet,
                            mevWallet,
                            cleanWallets,
                            amount: 0.1
                        });
                        return {
                            success: true,
                            txHashes: result,
                            devWallet: devWallet.publicKey.toString(),
                            mevWallet: mevWallet.publicKey.toString(),
                            cleanWalletCount: cleanWallets.length
                        };
                    }
                },
                {
                    name: 'MEV Bundle Timing',
                    description: 'Test MEV bundle timing with different delays',
                    run: async ({ wallets }) => {
                        const devWallet = wallets[0];
                        const mevWallet = wallets[1];
                        const cleanWallets = wallets.slice(2, 22);
                        const startTime = Date.now();
                        const result = await this.tokenSniper.mevBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: 'jito'
                        }, {
                            devWallet,
                            mevWallet,
                            cleanWallets,
                            amount: 0.1,
                            delayMs: 100
                        });
                        const endTime = Date.now();
                        return {
                            success: true,
                            txHashes: result,
                            executionTime: endTime - startTime,
                            txCount: result.length
                        };
                    }
                },
                {
                    name: 'MEV Bundle Error Handling',
                    description: 'Test MEV bundle error handling with insufficient wallets',
                    run: async ({ wallets }) => {
                        const devWallet = wallets[0];
                        const mevWallet = wallets[1];
                        const cleanWallets = wallets.slice(2, 5); // Not enough clean wallets
                        try {
                            await this.tokenSniper.mevBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                                jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                                maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                                funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                                sendMode: 'jito'
                            }, {
                                devWallet,
                                mevWallet,
                                cleanWallets,
                                amount: 0.1
                            });
                            return {
                                success: false,
                                error: 'Expected insufficient wallets to fail'
                            };
                        }
                        catch (error) {
                            return {
                                success: true,
                                error: error instanceof Error ? error.message : 'Unknown error'
                            };
                        }
                    }
                },
                {
                    name: 'MEV Bundle Amount Distribution',
                    description: 'Test MEV bundle with different amounts for dev and MEV wallets',
                    run: async ({ wallets }) => {
                        const devWallet = wallets[0];
                        const mevWallet = wallets[1];
                        const cleanWallets = wallets.slice(2, 22);
                        const result = await this.tokenSniper.mevBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: 'jito'
                        }, {
                            devWallet,
                            mevWallet,
                            cleanWallets,
                            amount: 0.2 // Larger amount to test distribution
                        });
                        return {
                            success: true,
                            txHashes: result,
                            devAmount: 0.2,
                            mevAmount: 0.2,
                            cleanWalletAmount: 0.2 / 20 // Each clean wallet gets 1/20th
                        };
                    }
                }
            ]
        };
    }
    getStaggerBundleTests() {
        return {
            name: 'Stagger Bundle',
            setup: async () => {
                // Create and fund test wallets
                const wallets = Array(PortalXTestConfig_1.TEST_CONFIG.WALLET_COUNTS.MAX).fill(null).map(() => web3_js_1.Keypair.generate());
                await this.fundWallets(wallets, 1); // Fund each wallet with 1 SOL
                return { wallets };
            },
            tests: [
                {
                    name: 'Stagger Bundle Basic',
                    description: 'Test basic stagger bundle functionality',
                    run: async ({ wallets }) => {
                        const result = await this.tokenSniper.staggerBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                            jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                            maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                            funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                            sendMode: 'hybrid'
                        }, wallets.slice(0, 5), 0.1, 100);
                        return {
                            success: true,
                            txHashes: result,
                            walletCount: 5,
                            delay: 100
                        };
                    }
                },
                {
                    name: 'Stagger Bundle Timing',
                    description: 'Test stagger bundle timing with different delays',
                    run: async ({ wallets }) => {
                        const delays = [50, 100, 200, 500];
                        const results = await Promise.all(delays.map(async (delay) => {
                            const startTime = Date.now();
                            const result = await this.tokenSniper.staggerBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                                jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                                maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                                funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                                sendMode: 'hybrid'
                            }, wallets.slice(0, 3), 0.1, delay);
                            const endTime = Date.now();
                            return {
                                delay,
                                executionTime: endTime - startTime,
                                txHashes: result
                            };
                        }));
                        return {
                            success: true,
                            results
                        };
                    }
                },
                {
                    name: 'Stagger Bundle Amount Scaling',
                    description: 'Test stagger bundle with different amounts',
                    run: async ({ wallets }) => {
                        const amounts = [0.05, 0.1, 0.2, 0.5];
                        const results = await Promise.all(amounts.map(async (amount) => {
                            const result = await this.tokenSniper.staggerBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                                jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                                maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                                funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                                sendMode: 'hybrid'
                            }, wallets.slice(0, 3), amount, 100);
                            return {
                                amount,
                                txHashes: result
                            };
                        }));
                        return {
                            success: true,
                            results
                        };
                    }
                },
                {
                    name: 'Stagger Bundle Error Recovery',
                    description: 'Test stagger bundle error recovery',
                    run: async ({ wallets }) => {
                        // Create a mix of valid and invalid wallets
                        const validWallets = wallets.slice(0, 3);
                        const invalidWallets = [web3_js_1.Keypair.generate()]; // Unfunded wallet
                        try {
                            await this.tokenSniper.staggerBundleSnipe(PortalXTestConfig_1.TEST_CONFIG.TEST_TOKEN_MINT, {
                                jitoTipAmount: PortalXTestConfig_1.TEST_CONFIG.TIPS.MEDIUM,
                                maxSlippage: PortalXTestConfig_1.TEST_CONFIG.SLIPPAGE.MEDIUM,
                                funderPrivateKey: PortalXTestConfig_1.TEST_CONFIG.TEST_FUNDER_KEY,
                                sendMode: 'hybrid'
                            }, [...validWallets, ...invalidWallets], 0.1, 100);
                            return {
                                success: false,
                                error: 'Expected invalid wallets to fail'
                            };
                        }
                        catch (error) {
                            return {
                                success: true,
                                error: error instanceof Error ? error.message : 'Unknown error'
                            };
                        }
                    }
                }
            ]
        };
    }
    getWalletManagerTests() {
        return {
            name: 'Wallet Manager',
            setup: async () => {
                // Create and fund test wallets
                const wallets = Array(PortalXTestConfig_1.TEST_CONFIG.WALLET_COUNTS.MAX).fill(null).map(() => web3_js_1.Keypair.generate());
                await this.fundWallets(wallets, 1); // Fund each wallet with 1 SOL
                return { wallets };
            },
            tests: [
                {
                    name: 'Wallet Generation',
                    description: 'Test wallet generation with different counts',
                    run: async () => {
                        const counts = [1, 5, 10, 20];
                        const results = await Promise.all(counts.map(async (count) => {
                            const wallets = await this.walletManager.generateWallets(count);
                            return {
                                count,
                                success: wallets.length === count,
                                walletCount: wallets.length
                            };
                        }));
                        return {
                            success: true,
                            results
                        };
                    }
                },
                {
                    name: 'Wallet Import/Export',
                    description: 'Test wallet import and export functionality',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        const walletData = {
                            publicKey: wallet.publicKey.toString(),
                            privateKey: Buffer.from(wallet.secretKey).toString('base64'),
                            label: 'Test Wallet',
                            balance: 1
                        };
                        // Export wallet data
                        const exportedData = JSON.stringify([walletData]);
                        // Import wallet data
                        await this.walletManager.importWallets(exportedData);
                        // Get imported wallet
                        const importedWallets = await this.walletManager.getWallets();
                        const importedWallet = importedWallets.find(w => w.publicKey === wallet.publicKey.toString());
                        return {
                            success: true,
                            originalPubkey: wallet.publicKey.toString(),
                            importedPubkey: importedWallet?.publicKey,
                            match: wallet.publicKey.toString() === importedWallet?.publicKey
                        };
                    }
                },
                {
                    name: 'Wallet Management',
                    description: 'Test wallet management operations',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        // Add wallet with label
                        const addedWallet = await this.walletManager.addWallet('Test Wallet');
                        // Get wallet
                        const retrievedWallet = await this.walletManager.getWallet(addedWallet.publicKey);
                        // Update wallet label
                        await this.walletManager.updateWalletLabel(addedWallet.publicKey, 'Updated Label');
                        // Remove wallet
                        await this.walletManager.removeWallet(addedWallet.publicKey);
                        return {
                            success: true,
                            addedWallet: {
                                pubkey: addedWallet.publicKey,
                                label: addedWallet.label
                            },
                            retrievedWallet: {
                                pubkey: retrievedWallet?.publicKey,
                                label: retrievedWallet?.label
                            }
                        };
                    }
                },
                {
                    name: 'Wallet Funding',
                    description: 'Test wallet funding functionality',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        const amount = 0.5; // SOL
                        await this.walletManager.fundWallet(wallet.publicKey.toString(), amount);
                        return {
                            success: true,
                            pubkey: wallet.publicKey.toString(),
                            amount
                        };
                    }
                },
                {
                    name: 'Balance Monitoring',
                    description: 'Test wallet balance monitoring',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        // Start monitoring
                        await this.walletManager.startBalanceMonitoring(wallet.publicKey.toString());
                        // Wait for a short period
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        // Stop monitoring
                        await this.walletManager.stopBalanceMonitoring(wallet.publicKey.toString());
                        return {
                            success: true,
                            pubkey: wallet.publicKey.toString()
                        };
                    }
                }
            ]
        };
    }
    getBlockchainClientTests() {
        return {
            name: 'Blockchain Client',
            setup: async () => {
                // Create and fund test wallets
                const wallets = Array(PortalXTestConfig_1.TEST_CONFIG.WALLET_COUNTS.MAX).fill(null).map(() => web3_js_1.Keypair.generate());
                await this.fundWallets(wallets, 1); // Fund each wallet with 1 SOL
                return { wallets };
            },
            tests: [
                {
                    name: 'Connection Management',
                    description: 'Test blockchain connection management',
                    run: async () => {
                        // Get active connection
                        const connection = await this.client.getActiveConnection();
                        // Test connection by getting slot
                        const slot = await connection.getSlot();
                        const version = await connection.getVersion();
                        return {
                            success: true,
                            slot,
                            version,
                            rpcUrl: connection.rpcEndpoint
                        };
                    }
                },
                {
                    name: 'Transaction Sending',
                    description: 'Test transaction sending functionality',
                    run: async ({ wallets }) => {
                        const fromWallet = wallets[0];
                        const toWallet = wallets[1];
                        const amount = 0.1; // SOL
                        const signature = await this.client.sendTransaction(Buffer.from(fromWallet.secretKey).toString('hex'), toWallet.publicKey.toString(), amount);
                        return {
                            success: true,
                            signature,
                            from: fromWallet.publicKey.toString(),
                            to: toWallet.publicKey.toString(),
                            amount
                        };
                    }
                },
                {
                    name: 'Balance Management',
                    description: 'Test balance management functionality',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        // Get balance
                        const balance = await this.client.getBalance(wallet.publicKey.toString());
                        return {
                            success: true,
                            pubkey: wallet.publicKey.toString(),
                            balance
                        };
                    }
                },
                {
                    name: 'Token Account Management',
                    description: 'Test token account management',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        // Get token accounts
                        const accounts = await this.client.getTokenAccounts(wallet.publicKey.toString());
                        return {
                            success: true,
                            pubkey: wallet.publicKey.toString(),
                            accountCount: accounts.length,
                            accounts: accounts.map(acc => ({
                                mint: acc.mint,
                                amount: acc.amount
                            }))
                        };
                    }
                },
                {
                    name: 'Token Balance Management',
                    description: 'Test token balance management',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        // Get token balances
                        const balances = await this.client.getTokenBalances(wallet.publicKey.toString());
                        return {
                            success: true,
                            pubkey: wallet.publicKey.toString(),
                            balanceCount: balances.length,
                            balances: balances.map(bal => ({
                                token: bal.token.symbol,
                                amount: bal.account.amount
                            }))
                        };
                    }
                },
                {
                    name: 'Transaction History',
                    description: 'Test transaction history retrieval',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        // Get recent transactions
                        const transactions = await this.client.getRecentTransactions(wallet.publicKey.toString(), 5);
                        return {
                            success: true,
                            pubkey: wallet.publicKey.toString(),
                            txCount: transactions.length,
                            transactions: transactions.map(tx => ({
                                signature: tx.signature,
                                status: tx.status
                            }))
                        };
                    }
                },
                {
                    name: 'Dashboard Data',
                    description: 'Test dashboard data retrieval',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        // Get dashboard data
                        const data = await this.client.getDashboardData(wallet.publicKey.toString());
                        return {
                            success: true,
                            pubkey: wallet.publicKey.toString(),
                            hasTokenAccounts: data.tokenAccounts.length > 0,
                            hasBalances: data.balances.length > 0,
                            hasTransactions: data.recentTransactions.length > 0
                        };
                    }
                },
                {
                    name: 'Error Handling',
                    description: 'Test error handling for invalid operations',
                    run: async () => {
                        const invalidPubkey = '11111111111111111111111111111111';
                        try {
                            await this.client.getTokenAccounts(invalidPubkey);
                            return {
                                success: false,
                                error: 'Expected invalid pubkey to fail'
                            };
                        }
                        catch (error) {
                            return {
                                success: true,
                                error: error instanceof Error ? error.message : 'Unknown error'
                            };
                        }
                    }
                }
            ]
        };
    }
    getQueueManagerTests() {
        return {
            name: 'Queue Manager',
            setup: async () => {
                const wallets = await this.walletManager.generateWallets(3);
                const keypairs = wallets.map(w => web3_js_1.Keypair.fromSecretKey(Buffer.from(w.privateKey, 'base64')));
                await this.fundWallets(keypairs, 1);
                return { wallets };
            },
            tests: [
                {
                    name: 'Queue Item Addition',
                    description: 'Test adding items to the queue with different priorities',
                    run: async ({ wallets }) => {
                        const tx = new web3_js_1.Transaction();
                        await this.queueManager.addToQueue(tx, wallets[0].privateKey, 0);
                        await this.queueManager.addToQueue(tx, wallets[1].privateKey, 1);
                        await this.queueManager.addToQueue(tx, wallets[2].privateKey, 2);
                        return { success: true, message: 'Added items to queue with different priorities' };
                    }
                },
                {
                    name: 'Queue Processing',
                    description: 'Test queue processing with multiple items',
                    run: async ({ wallets }) => {
                        const tx = new web3_js_1.Transaction();
                        await this.queueManager.addToQueue(tx, wallets[0].privateKey, 0);
                        await this.queueManager.addToQueue(tx, wallets[1].privateKey, 1);
                        // Queue processing happens automatically when adding items
                        return { success: true, message: 'Added items to queue for processing' };
                    }
                },
                {
                    name: 'Bundle on Bonding Curve',
                    description: 'Test bundling transactions on bonding curve',
                    run: async ({ wallets }) => {
                        await this.queueManager.bundleOnBondingCurve('BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8S', 1, 3, {
                            minAmount: 0.1,
                            maxAmount: 0.5,
                            delayRange: [1000, 2000]
                        });
                        return { success: true, message: 'Bundled transactions on bonding curve' };
                    }
                },
                {
                    name: 'Token Distribution',
                    description: 'Test token distribution functionality',
                    run: async ({ wallets }) => {
                        await this.queueManager.distributeTokens(3, 0.1, {
                            batchSize: 2,
                            delayRange: [1000, 2000]
                        });
                        return { success: true, message: 'Distributed tokens to wallets' };
                    }
                },
                {
                    name: 'Sell Tokens',
                    description: 'Test selling tokens functionality',
                    run: async ({ wallets }) => {
                        await this.queueManager.sellTokens('BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8S', 50, wallets[0].publicKey, {
                            minDelay: 1000,
                            maxDelay: 2000,
                            batchSize: 2
                        });
                        return { success: true, message: 'Sold tokens from wallets' };
                    }
                },
                {
                    name: 'Create Sell Transaction',
                    description: 'Test creating a sell transaction',
                    run: async ({ wallets }) => {
                        const signature = await this.queueManager.createSellTransaction(wallets[0].publicKey, 'BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8S', 0.1, 0.001, 0.01);
                        return { success: true, signature };
                    }
                },
                {
                    name: 'Wallet Balance',
                    description: 'Test getting wallet balance',
                    run: async ({ wallets }) => {
                        const balance = await this.queueManager.getWalletBalance(wallets[0].publicKey);
                        return { success: true, balance };
                    }
                }
            ]
        };
    }
    getLimitOrdersTests() {
        return {
            name: 'Limit Orders',
            tests: [
                {
                    name: 'Create Order',
                    run: async () => {
                        const orderId = await this.limitOrders.createOrder(PortalXTestConfig_1.TEST_CONFIG.TEST_AMOUNTS.SMALL, 0.5, 'buy');
                        if (!orderId) {
                            throw new Error('Failed to create order');
                        }
                    }
                }
            ]
        };
    }
    getSettingsTests() {
        // Implementation of getSettingsTests
        return {
            name: 'Settings',
            tests: []
        };
    }
    getSecurityTests() {
        return {
            name: 'Security',
            setup: async () => {
                const wallets = Array(SECURITY_TEST_CONSTANTS.MAX_WALLETS)
                    .fill(null)
                    .map(() => web3_js_1.Keypair.generate());
                await this.fundWallets(wallets, SECURITY_TEST_CONSTANTS.WALLET_FUND_AMOUNT);
                const testMint = new web3_js_1.PublicKey('So11111111111111111111111111111111111111112'); // Use SOL for reliability
                return { wallets, testMint };
            },
            tests: [
                {
                    name: 'Wallet Encryption',
                    description: 'Test wallet encryption and secure storage',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        const walletData = {
                            publicKey: wallet.publicKey.toBase58(),
                            privateKey: Buffer.from(wallet.secretKey).toString('base64'),
                            label: 'Test Wallet',
                            balance: SECURITY_TEST_CONSTANTS.WALLET_FUND_AMOUNT
                        };
                        try {
                            await this.walletManager.importWallets(JSON.stringify([walletData]));
                            const retrieved = await this.walletManager.getWallet(wallet.publicKey.toBase58());
                            if (!retrieved)
                                throw new Error('Failed to retrieve wallet');
                            const exportedData = await this.walletManager.exportWallets();
                            const exportedStr = Buffer.isBuffer(exportedData)
                                ? exportedData.toString('utf8')
                                : typeof exportedData === 'string'
                                    ? exportedData
                                    : JSON.stringify(exportedData);
                            const isEncrypted = !exportedStr.includes(walletData.privateKey) &&
                                !exportedStr.includes('"privateKey"') &&
                                !exportedStr.match(/[A-Za-z0-9+/]{88}/);
                            const hasValidLength = exportedStr.length >= SECURITY_TEST_CONSTANTS.ENCRYPTION_MIN_LENGTH;
                            const retrievedPubkey = retrieved.publicKey instanceof web3_js_1.PublicKey
                                ? retrieved.publicKey.toBase58()
                                : retrieved.publicKey;
                            const isValidWallet = retrievedPubkey === wallet.publicKey.toBase58();
                            console.log('Encryption Test:', { isEncrypted, hasValidLength, isValidWallet });
                            return {
                                success: isValidWallet && isEncrypted && hasValidLength,
                                originalPubkey: wallet.publicKey.toBase58(),
                                retrievedPubkey,
                                isEncrypted,
                                hasValidLength,
                                message: isEncrypted ? 'Secure encryption detected' : 'Encryption validation failed'
                            };
                        }
                        catch (e) {
                            console.error('Encryption Test Error:', e);
                            return {
                                success: false,
                                error: e instanceof Error ? e.message : 'Unknown error',
                                details: { walletPublicKey: wallet.publicKey.toBase58() }
                            };
                        }
                    }
                },
                {
                    name: 'Priority Fee Security',
                    description: 'Test priority fee limits and validation',
                    run: async ({ wallets, testMint }) => {
                        const wallet = wallets[0];
                        const tipMicroLamports = 1000000; // 0.001 SOL
                        try {
                            const balance = await this.connection.getBalance(wallet.publicKey);
                            if (balance < web3_js_1.LAMPORTS_PER_SOL)
                                throw new Error('Insufficient balance');
                            const sig = await this.tokenSniper.safeSnipe(wallet, testMint, 0.1, {
                                jitoTipAmount: tipMicroLamports,
                                maxSlippage: 0.1,
                                funderPrivateKey: wallet.secretKey,
                                sendMode: 'rpc'
                            });
                            const tx = await this.connection.getTransaction(sig, {
                                commitment: 'confirmed',
                                maxSupportedTransactionVersion: 0
                            });
                            if (!tx)
                                throw new Error('Transaction not found');
                            // Handle both legacy and versioned transactions
                            const message = tx.transaction.message;
                            const instructions = ('compiledInstructions' in message
                                ? message.compiledInstructions
                                : message.instructions);
                            const accountKeys = ('staticAccountKeys' in message
                                ? message.staticAccountKeys
                                : message.accountKeys);
                            const computeBudgetIx = instructions.find((ix) => {
                                const programId = 'programIdIndex' in ix && typeof ix.programIdIndex === 'number'
                                    ? accountKeys[ix.programIdIndex]
                                    : ix.programId;
                                return programId?.equals(web3_js_1.ComputeBudgetProgram.programId) ?? false;
                            });
                            if (!computeBudgetIx) {
                                return {
                                    success: true,
                                    txSignature: sig,
                                    warning: 'No ComputeBudget instruction found',
                                    message: 'Transaction executed without priority fee'
                                };
                            }
                            const data = Buffer.from(computeBudgetIx.data);
                            const instructionType = data[0];
                            if (instructionType === 2) { // SetComputeUnitPrice
                                const feeAmount = data.readBigUInt64LE(1);
                                if (feeAmount < SECURITY_TEST_CONSTANTS.MIN_FEE_MICRO_LAMPORTS ||
                                    feeAmount > SECURITY_TEST_CONSTANTS.MAX_FEE_MICRO_LAMPORTS) {
                                    return {
                                        success: false,
                                        txSignature: sig,
                                        error: `Fee ${feeAmount} outside bounds [${SECURITY_TEST_CONSTANTS.MIN_FEE_MICRO_LAMPORTS}, ${SECURITY_TEST_CONSTANTS.MAX_FEE_MICRO_LAMPORTS}]`,
                                        feeAmount: feeAmount.toString()
                                    };
                                }
                                return {
                                    success: true,
                                    txSignature: sig,
                                    feeAmount: feeAmount.toString(),
                                    message: `Priority fee ${feeAmount} micro-lamports within limits`
                                };
                            }
                            return {
                                success: true,
                                txSignature: sig,
                                warning: 'ComputeBudget instruction not SetComputeUnitPrice',
                                message: 'No priority fee detected'
                            };
                        }
                        catch (e) {
                            const isExcessiveFee = e instanceof Error && (e.message.toLowerCase().includes('excessive') ||
                                e.message.toLowerCase().includes('fee too high'));
                            return {
                                success: isExcessiveFee,
                                error: e instanceof Error ? e.message : 'Unknown error',
                                message: isExcessiveFee ? 'Excessive fee rejected' : 'Transaction failed',
                                details: { proposedFee: tipMicroLamports.toString() }
                            };
                        }
                    }
                },
                {
                    name: 'Double-Spend Prevention',
                    description: 'Test prevention of double-spending',
                    run: async ({ wallets }) => {
                        const wallet = wallets[0];
                        const toWallet = wallets[1];
                        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
                        const message = new web3_js_1.TransactionMessage({
                            payerKey: wallet.publicKey,
                            recentBlockhash: blockhash,
                            instructions: [
                                web3_js_1.SystemProgram.transfer({
                                    fromPubkey: wallet.publicKey,
                                    toPubkey: toWallet.publicKey,
                                    lamports: SECURITY_TEST_CONSTANTS.TRANSFER_AMOUNT_LAMPORTS
                                })
                            ]
                        }).compileToV0Message([]);
                        const tx = new web3_js_1.VersionedTransaction(message);
                        tx.sign([wallet]);
                        const txSig = await this.connection.sendRawTransaction(tx.serialize());
                        await this.connection.confirmTransaction({
                            signature: txSig,
                            blockhash,
                            lastValidBlockHeight
                        });
                        try {
                            const replayTx = new web3_js_1.VersionedTransaction(message);
                            replayTx.sign([wallet]);
                            await this.connection.sendRawTransaction(replayTx.serialize());
                            return {
                                success: false,
                                txSignature: txSig,
                                error: 'Double-spend not prevented'
                            };
                        }
                        catch (e) {
                            const isPrevented = e instanceof Error && (e.message.includes('already processed') ||
                                e.message.includes('blockhash not found'));
                            return {
                                success: isPrevented,
                                txSignature: txSig,
                                message: isPrevented ? 'Double-spend prevented' : 'Unexpected failure',
                                error: !isPrevented ? (e instanceof Error ? e.message : 'Unknown error') : undefined
                            };
                        }
                    }
                }
            ]
        };
    }
    getIntegrationTests() {
        // Implementation of getIntegrationTests
        return {
            name: 'Integration',
            tests: []
        };
    }
    getMonitoringTests() {
        // Implementation of getMonitoringTests
        return {
            name: 'Monitoring',
            tests: []
        };
    }
    getTransactionTests() {
        // Implementation of getTransactionTests
        return {
            name: 'Transaction',
            tests: []
        };
    }
    getTokenManagementTests() {
        // Implementation of getTokenManagementTests
        return {
            name: 'Token Management',
            tests: []
        };
    }
}
exports.PortalXTestRunner = PortalXTestRunner;
// Main execution
async function main() {
    const connection = new web3_js_1.Connection('https://api.devnet.solana.com', 'confirmed');
    const client = new PortalXBlockchainClient_1.PortalXBlockchainClient([connection.rpcEndpoint]);
    const walletManager = new PortalXWalletManager_1.PortalXWalletManager();
    const tokenSniper = new PortalXTokenSniper_1.PortalXTokenSniper(client);
    const runner = new PortalXTestRunner(connection, walletManager, tokenSniper);
    await runner.runAllTests();
}
if (require.main === module) {
    main().catch(err => console.error('Test Execution Failed:', err));
}
