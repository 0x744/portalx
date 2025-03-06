import { describe, it, expect, beforeEach, vi } from 'vitest';
import useWalletStorage from '../walletStorageService';
import Store from 'electron-store';

// Mock electron-store
vi.mock('electron-store', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn(),
      set: vi.fn(),
    })),
  };
});

describe('WalletStorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store before each test
    const store = new Store();
    store.set('wallets', []);
  });

  it('should add a new wallet', async () => {
    const { addWallet, wallets } = useWalletStorage.getState();
    await addWallet('Test Wallet');
    
    expect(wallets).toHaveLength(1);
    expect(wallets[0].label).toBe('Test Wallet');
    expect(wallets[0].publicKey).toBeDefined();
    expect(wallets[0].privateKey).toBeDefined();
    expect(wallets[0].balance).toBe(0);
  });

  it('should remove a wallet', async () => {
    const { addWallet, removeWallet, wallets } = useWalletStorage.getState();
    await addWallet('Test Wallet');
    const publicKey = wallets[0].publicKey;
    
    await removeWallet(publicKey);
    expect(wallets).toHaveLength(0);
  });

  it('should update wallet balance', async () => {
    const { addWallet, updateWalletBalance, wallets } = useWalletStorage.getState();
    await addWallet('Test Wallet');
    const publicKey = wallets[0].publicKey;
    
    await updateWalletBalance(publicKey, 1.5);
    expect(wallets[0].balance).toBe(1.5);
  });

  it('should get a specific wallet', async () => {
    const { addWallet, getWallet, wallets } = useWalletStorage.getState();
    await addWallet('Test Wallet');
    const publicKey = wallets[0].publicKey;
    
    const wallet = getWallet(publicKey);
    expect(wallet).toBeDefined();
    expect(wallet?.publicKey).toBe(publicKey);
  });

  it('should get all wallets', async () => {
    const { addWallet, getAllWallets } = useWalletStorage.getState();
    await addWallet('Wallet 1');
    await addWallet('Wallet 2');
    
    const wallets = getAllWallets();
    expect(wallets).toHaveLength(2);
  });

  it('should handle errors when adding wallet', async () => {
    const { addWallet, error } = useWalletStorage.getState();
    // Mock an error by invalidating the store
    vi.spyOn(Store.prototype, 'set').mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    
    await addWallet('Test Wallet');
    expect(error).toBe('Storage error');
  });
}); 