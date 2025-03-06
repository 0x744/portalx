import { PublicKey } from '@solana/web3.js';

export class PortalXValidation {
  static isValidPrivateKey(key: string): boolean {
    try {
      const buffer = Buffer.from(key, 'hex');
      return buffer.length === 64; // Solana private key length
    } catch {
      return false;
    }
  }

  static isValidPublicKey(key: string): boolean {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  }

  validateAmount(amount: number): boolean {
    return !isNaN(amount) && amount > 0 && amount <= 1000000; // Max 1M tokens
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  static isValidTokenName(name: string): boolean {
    return name.length >= 3 && name.length <= 32 && /^[a-zA-Z0-9\s]+$/.test(name);
  }

  static isValidTokenSymbol(symbol: string): boolean {
    return symbol.length >= 2 && symbol.length <= 10 && /^[A-Z0-9]+$/.test(symbol);
  }

  static isValidDecimals(decimals: number): boolean {
    return Number.isInteger(decimals) && decimals >= 0 && decimals <= 9;
  }

  static isValidSupply(supply: number): boolean {
    return Number.isInteger(supply) && supply > 0 && supply <= 1_000_000_000_000;
  }

  static isValidPoolLiquidity(liquidity: number): boolean {
    return liquidity > 0 && liquidity <= 1000000; // Max 1M SOL liquidity
  }

  static isValidSwapAmount(amount: number): boolean {
    return amount > 0 && amount <= 100000; // Max 100K tokens per swap
  }

  static isValidLimitOrderPrice(price: number): boolean {
    return price > 0 && price <= 1000000; // Max 1M SOL per token
  }

  static isValidWalletCount(count: number): boolean {
    return Number.isInteger(count) && count > 0 && count <= 1000; // Max 1000 wallets
  }

  static isValidRpcUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('https://') && 
             (url.includes('solana.com') || 
              url.includes('jito.wtf') || 
              url.includes('genesysgo.net'));
    } catch {
      return false;
    }
  }

  static isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidDescription(description: string): boolean {
    return description.length >= 10 && description.length <= 500;
  }

  static sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, ''); // Basic XSS prevention
  }

  static formatAmount(amount: number, decimals: number = 9): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  static parseAmount(amount: string, decimals: number = 9): number {
    return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
  }

  validateWalletCount(count: number): boolean {
    return count > 0 && count <= 100;
  }

  validatePassword(password: string): boolean {
    return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  validateLabel(label: string): boolean {
    return label.length > 0 && label.length <= 50;
  }
} 