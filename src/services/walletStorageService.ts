import { Keypair } from '@solana/web3.js';
import Store from 'electron-store';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { encrypt } from '../utils/encryption';

interface WalletData {
  publicKey: string;
  privateKey: string;
  label: string;
  balance: number;
  lastUpdated: number;
}

interface WalletStorageState {
  wallets: WalletData[];
  isLoading: boolean;
  error: string | null;
  addWallet: (_label: string) => Promise<void>;
  removeWallet: (_publicKey: string) => Promise<void>;
  updateWalletBalance: (_publicKey: string, _balance: number) => Promise<void>;
  getWallet: (_publicKey: string) => WalletData | undefined;
  getAllWallets: () => WalletData[];
}

const store = new Store({
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

const useWalletStorage = create<WalletStorageState>()(
  devtools(
    (set, get) => ({
      wallets: store.get('wallets', []) as WalletData[],
      isLoading: false,
      error: null,

      addWallet: async (_label: string) => {
        set({ isLoading: true, error: null });
        try {
          const keypair = Keypair.generate();
          const walletData: WalletData = {
            publicKey: keypair.publicKey.toString(),
            privateKey: encrypt(keypair.secretKey.toString()),
            label: _label,
            balance: 0,
            lastUpdated: Date.now(),
          };

          const wallets = [...get().wallets, walletData];
          store.set('wallets', wallets);
          set({ wallets, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add wallet',
            isLoading: false,
          });
        }
      },

      removeWallet: async (_publicKey: string) => {
        set({ isLoading: true, error: null });
        try {
          const wallets = get().wallets.filter((w: WalletData) => w.publicKey !== _publicKey);
          store.set('wallets', wallets);
          set({ wallets, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove wallet',
            isLoading: false,
          });
        }
      },

      updateWalletBalance: async (_publicKey: string, _balance: number) => {
        set({ isLoading: true, error: null });
        try {
          const wallets = get().wallets.map((w: WalletData) =>
            w.publicKey === _publicKey
              ? { ...w, balance: _balance, lastUpdated: Date.now() }
              : w
          );
          store.set('wallets', wallets);
          set({ wallets, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update wallet balance',
            isLoading: false,
          });
        }
      },

      getWallet: (_publicKey: string) => {
        return get().wallets.find((w: WalletData) => w.publicKey === _publicKey);
      },

      getAllWallets: () => {
        return get().wallets;
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);

export default useWalletStorage; 