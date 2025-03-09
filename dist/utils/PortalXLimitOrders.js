"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalXLimitOrders = void 0;
const web3_js_1 = require("@solana/web3.js");
const PortalXRaydiumManager_1 = require("./PortalXRaydiumManager");
const PortalXValidation_1 = require("./PortalXValidation");
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.simple(),
    transports: [
        new winston_1.default.transports.File({ filename: 'portalx.log' }),
        new winston_1.default.transports.Console()
    ]
});
// WARNING: Using testnet configuration
const TOKEN_MINT = process.env.TOKEN_MINT || "BdYtxSFfnAu1VWGS8TeK9iHaB38DiEYVd9N5Ke8SQWcC";
class PortalXLimitOrders {
    constructor(client) {
        this.orders = new Map();
        this.monitoringInterval = null;
        this.TOKEN_MINT = new web3_js_1.PublicKey(TOKEN_MINT);
        if (!client) {
            throw new Error('PortalXBlockchainClient is required');
        }
        this.client = client;
        this.raydiumManager = new PortalXRaydiumManager_1.PortalXRaydiumManager(client, this.TOKEN_MINT.toBase58());
        this.startMonitoring();
        logger.info('PortalXLimitOrders initialized with token mint:', this.TOKEN_MINT.toBase58());
    }
    async createOrder(amount, price, type, expiresIn = 24 * 60 * 60 * 1000 // 24 hours
    ) {
        try {
            if (!PortalXValidation_1.PortalXValidation.isValidSwapAmount(amount)) {
                throw new Error('Invalid amount');
            }
            if (price <= 0) {
                throw new Error('Price must be greater than 0');
            }
            if (expiresIn <= 0) {
                throw new Error('Expiration time must be greater than 0');
            }
            const order = {
                id: Math.random().toString(36).substring(7),
                tokenMint: this.TOKEN_MINT.toBase58(),
                amount,
                price,
                type,
                status: 'pending',
                createdAt: Date.now(),
                expiresAt: Date.now() + expiresIn,
                privateKey: ''
            };
            this.orders.set(order.id, order);
            logger.info(`Created ${type} limit order for ${amount} tokens at ${price} SOL`);
            return order.id;
        }
        catch (error) {
            logger.error('Failed to create limit order:', error);
            throw error;
        }
    }
    async cancelOrder(orderId) {
        try {
            const order = this.orders.get(orderId);
            if (!order) {
                throw new Error('Order not found');
            }
            order.status = 'cancelled';
            this.orders.set(orderId, order);
            logger.info(`Cancelled limit order ${orderId}`);
        }
        catch (error) {
            logger.error('Failed to cancel limit order:', error);
            throw error;
        }
    }
    async getOrders() {
        return Array.from(this.orders.values());
    }
    async startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.monitoringInterval = setInterval(async () => {
            const pendingOrders = Array.from(this.orders.entries())
                .filter(([_, order]) => order.status === 'pending');
            for (const [orderId, order] of pendingOrders) {
                try {
                    if (Date.now() > order.expiresAt) {
                        order.status = 'cancelled';
                        this.orders.set(orderId, order);
                        logger.info(`Order ${orderId} expired`);
                        continue;
                    }
                    const currentPrice = await this.raydiumManager.getTokenPrice(order.tokenMint);
                    if (currentPrice <= order.price) {
                        await this.executeOrder(order);
                        order.status = 'executed';
                        this.orders.set(orderId, order);
                        logger.info(`Order executed: ${orderId}`);
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    logger.error(`Error monitoring order ${orderId}: ${errorMessage}`);
                }
            }
        }, 1000);
    }
    async executeOrder(order) {
        // Implementation of executeOrder method
        logger.info(`Executing order: ${order.id}`);
    }
}
exports.PortalXLimitOrders = PortalXLimitOrders;
