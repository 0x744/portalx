"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const electron_store_1 = __importDefault(require("electron-store"));
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const encryption_1 = require("../utils/encryption");
const store = new electron_store_1.default({
    encryptionKey: process.env.STORE_ENCRYPTION_KEY || 'your-secure-encryption-key',
    schema: {
        wallets: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    publicKey: { type: 'string' },
                    privateKey: { type: 'string' },
                    label: { type: 'string' },
                    balance: { type: 'number' },
                    lastUpdated: { type: 'number' },
                },
                required: ['publicKey', 'privateKey', 'label', 'balance', 'lastUpdated'],
            },
        },
    },
});
const useWalletStorage = (0, zustand_1.create)()((0, middleware_1.devtools)((set, get) => ({
    wallets: store.get('wallets', []),
    isLoading: false,
    error: null,
    addWallet: async (_label) => {
        set({ isLoading: true, error: null });
        try {
            const keypair = web3_js_1.Keypair.generate();
            const walletData = {
                publicKey: keypair.publicKey.toString(),
                privateKey: (0, encryption_1.encrypt)(keypair.secretKey.toString()),
                label: _label,
                balance: 0,
                lastUpdated: Date.now(),
            };
            const wallets = [...get().wallets, walletData];
            store.set('wallets', wallets);
            set({ wallets, isLoading: false });
        }
        catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to add wallet',
                isLoading: false,
            });
        }
    },
    removeWallet: async (_publicKey) => {
        set({ isLoading: true, error: null });
        try {
            const wallets = get().wallets.filter((w) => w.publicKey !== _publicKey);
            store.set('wallets', wallets);
            set({ wallets, isLoading: false });
        }
        catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to remove wallet',
                isLoading: false,
            });
        }
    },
    updateWalletBalance: async (_publicKey, _balance) => {
        set({ isLoading: true, error: null });
        try {
            const wallets = get().wallets.map((w) => w.publicKey === _publicKey
                ? { ...w, balance: _balance, lastUpdated: Date.now() }
                : w);
            store.set('wallets', wallets);
            set({ wallets, isLoading: false });
        }
        catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update wallet balance',
                isLoading: false,
            });
        }
    },
    getWallet: (_publicKey) => {
        return get().wallets.find((w) => w.publicKey === _publicKey);
    },
    getAllWallets: () => {
        return get().wallets;
    },
}), {
    name: 'wallet-storage',
}));
exports.default = useWalletStorage;
