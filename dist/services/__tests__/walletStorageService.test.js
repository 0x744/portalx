"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const walletStorageService_1 = __importDefault(require("../walletStorageService"));
const electron_store_1 = __importDefault(require("electron-store"));
// Mock electron-store
vitest_1.vi.mock('electron-store', () => {
    return {
        default: vitest_1.vi.fn().mockImplementation(() => ({
            get: vitest_1.vi.fn(),
            set: vitest_1.vi.fn(),
        })),
    };
});
(0, vitest_1.describe)('WalletStorageService', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        // Reset store before each test
        const store = new electron_store_1.default();
        store.set('wallets', []);
    });
    (0, vitest_1.it)('should add a new wallet', async () => {
        const { addWallet, wallets } = walletStorageService_1.default.getState();
        await addWallet('Test Wallet');
        (0, vitest_1.expect)(wallets).toHaveLength(1);
        (0, vitest_1.expect)(wallets[0].label).toBe('Test Wallet');
        (0, vitest_1.expect)(wallets[0].publicKey).toBeDefined();
        (0, vitest_1.expect)(wallets[0].privateKey).toBeDefined();
        (0, vitest_1.expect)(wallets[0].balance).toBe(0);
    });
    (0, vitest_1.it)('should remove a wallet', async () => {
        const { addWallet, removeWallet, wallets } = walletStorageService_1.default.getState();
        await addWallet('Test Wallet');
        const publicKey = wallets[0].publicKey;
        await removeWallet(publicKey);
        (0, vitest_1.expect)(wallets).toHaveLength(0);
    });
    (0, vitest_1.it)('should update wallet balance', async () => {
        const { addWallet, updateWalletBalance, wallets } = walletStorageService_1.default.getState();
        await addWallet('Test Wallet');
        const publicKey = wallets[0].publicKey;
        await updateWalletBalance(publicKey, 1.5);
        (0, vitest_1.expect)(wallets[0].balance).toBe(1.5);
    });
    (0, vitest_1.it)('should get a specific wallet', async () => {
        const { addWallet, getWallet, wallets } = walletStorageService_1.default.getState();
        await addWallet('Test Wallet');
        const publicKey = wallets[0].publicKey;
        const wallet = getWallet(publicKey);
        (0, vitest_1.expect)(wallet).toBeDefined();
        (0, vitest_1.expect)(wallet?.publicKey).toBe(publicKey);
    });
    (0, vitest_1.it)('should get all wallets', async () => {
        const { addWallet, getAllWallets } = walletStorageService_1.default.getState();
        await addWallet('Wallet 1');
        await addWallet('Wallet 2');
        const wallets = getAllWallets();
        (0, vitest_1.expect)(wallets).toHaveLength(2);
    });
    (0, vitest_1.it)('should handle errors when adding wallet', async () => {
        const { addWallet, error } = walletStorageService_1.default.getState();
        // Mock an error by invalidating the store
        vitest_1.vi.spyOn(electron_store_1.default.prototype, 'set').mockImplementationOnce(() => {
            throw new Error('Storage error');
        });
        await addWallet('Test Wallet');
        (0, vitest_1.expect)(error).toBe('Storage error');
    });
});
