"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXValidation = void 0;
const web3_js_1 = require("@solana/web3.js");
class PortalXValidation {
    static isValidPrivateKey(key) {
        try {
            const buffer = Buffer.from(key, 'hex');
            return buffer.length === 64; // Solana private key length
        }
        catch {
            return false;
        }
    }
    static isValidPublicKey(key) {
        try {
            new web3_js_1.PublicKey(key);
            return true;
        }
        catch {
            return false;
        }
    }
    validateAmount(amount) {
        return !isNaN(amount) && amount > 0 && amount <= 1000000; // Max 1M tokens
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        }
        catch {
            return false;
        }
    }
    static isValidTokenName(name) {
        return name.length >= 3 && name.length <= 32 && /^[a-zA-Z0-9\s]+$/.test(name);
    }
    static isValidTokenSymbol(symbol) {
        return symbol.length >= 2 && symbol.length <= 10 && /^[A-Z0-9]+$/.test(symbol);
    }
    static isValidDecimals(decimals) {
        return Number.isInteger(decimals) && decimals >= 0 && decimals <= 9;
    }
    static isValidSupply(supply) {
        return Number.isInteger(supply) && supply > 0 && supply <= 1000000000000;
    }
    static isValidPoolLiquidity(liquidity) {
        return liquidity > 0 && liquidity <= 1000000; // Max 1M SOL liquidity
    }
    static isValidSwapAmount(amount) {
        return amount > 0 && amount <= 100000; // Max 100K tokens per swap
    }
    static isValidLimitOrderPrice(price) {
        return price > 0 && price <= 1000000; // Max 1M SOL per token
    }
    static isValidWalletCount(count) {
        return Number.isInteger(count) && count > 0 && count <= 1000; // Max 1000 wallets
    }
    static isValidRpcUrl(url) {
        try {
            new URL(url);
            return url.startsWith('https://') &&
                (url.includes('solana.com') ||
                    url.includes('jito.wtf') ||
                    url.includes('genesysgo.net'));
        }
        catch {
            return false;
        }
    }
    static isValidImageUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static isValidDescription(description) {
        return description.length >= 10 && description.length <= 500;
    }
    static sanitizeInput(input) {
        return input.replace(/[<>]/g, ''); // Basic XSS prevention
    }
    static formatAmount(amount, decimals = 9) {
        return (amount / Math.pow(10, decimals)).toFixed(decimals);
    }
    static parseAmount(amount, decimals = 9) {
        return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
    }
    validateWalletCount(count) {
        return count > 0 && count <= 100;
    }
    validatePassword(password) {
        return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    }
    validateLabel(label) {
        return label.length > 0 && label.length <= 50;
    }
}
exports.PortalXValidation = PortalXValidation;
