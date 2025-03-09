# PortalX Services Documentation

## Wallet Storage Service

The `walletStorageService` provides secure storage and management of Solana wallets using electron-store and encryption.

### Features

- Secure wallet storage with encryption
- Wallet creation and management
- Balance tracking
- Error handling
- Loading states

### Usage

```typescript
import useWalletStorage from './walletStorageService';

// Add a new wallet
const { addWallet } = useWalletStorage();
await addWallet('My Wallet');

// Get all wallets
const { getAllWallets } = useWalletStorage();
const wallets = getAllWallets();

// Update wallet balance
const { updateWalletBalance } = useWalletStorage();
await updateWalletBalance(publicKey, 1.5);

// Remove a wallet
const { removeWallet } = useWalletStorage();
await removeWallet(publicKey);
```

### API Reference

#### State

```typescript
interface WalletStorageState {
  wallets: WalletData[];
  isLoading: boolean;
  error: string | null;
  addWallet: (label: string) => Promise<void>;
  removeWallet: (publicKey: string) => Promise<void>;
  updateWalletBalance: (publicKey: string, balance: number) => Promise<void>;
  getWallet: (publicKey: string) => WalletData | undefined;
  getAllWallets: () => WalletData[];
}
```

#### Wallet Data Structure

```typescript
interface WalletData {
  publicKey: string;
  privateKey: string; // Encrypted
  label: string;
  balance: number;
  lastUpdated: number;
}
```

### Security

- Private keys are encrypted using AES-256-GCM
- Data is stored securely using electron-store
- Encryption keys are managed through environment variables

### Error Handling

The service includes comprehensive error handling for:
- Wallet creation failures
- Storage errors
- Encryption/decryption errors
- Invalid wallet data

### Loading States

All async operations include loading states:
- `isLoading`: boolean indicating if an operation is in progress
- `error`: string | null containing any error messages

## Price Service

The `priceService` provides real-time and historical price data for Solana.

### Features

- Real-time price updates
- Historical price data
- Volume tracking
- Price change calculations

### Usage

```typescript
import usePriceStore from './priceService';

// Get current price
const { priceData } = usePriceStore();
const currentPrice = priceData[priceData.length - 1]?.price;

// Fetch historical data
const { fetchHistoricalData } = usePriceStore();
await fetchHistoricalData(7); // 7 days of data
```

### API Reference

#### State

```typescript
interface PriceState {
  priceData: PriceData[];
  isLoading: boolean;
  error: string | null;
  fetchPrice: () => Promise<void>;
  fetchHistoricalData: (days: number) => Promise<void>;
}
```

#### Price Data Structure

```typescript
interface PriceData {
  price: number;
  timestamp: number;
  volume24h: number;
  priceChange24h: number;
}
```

### Error Handling

The service includes error handling for:
- API request failures
- Data parsing errors
- Network issues

### Loading States

All async operations include loading states:
- `isLoading`: boolean indicating if an operation is in progress
- `error`: string | null containing any error messages 