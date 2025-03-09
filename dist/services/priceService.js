"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const usePriceStore = (0, zustand_1.create)()((0, middleware_1.devtools)((set, get) => ({
    priceData: [],
    isLoading: false,
    error: null,
    fetchPrice: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true');
            const data = await response.json();
            const newPriceData = {
                price: data.solana.usd,
                timestamp: Date.now(),
                volume24h: data.solana.usd_24h_vol,
                priceChange24h: data.solana.usd_24h_change,
            };
            set((state) => ({
                priceData: [...state.priceData, newPriceData].slice(-100), // Keep last 100 data points
                isLoading: false,
            }));
        }
        catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch price data',
                isLoading: false
            });
        }
    },
    fetchHistoricalData: async (days) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${days}`);
            const data = await response.json();
            const historicalData = data.prices.map(([timestamp, price]) => ({
                price,
                timestamp,
                volume24h: 0, // Historical volume data not available in this endpoint
                priceChange24h: 0,
            }));
            set({
                priceData: historicalData,
                isLoading: false,
            });
        }
        catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch historical data',
                isLoading: false
            });
        }
    },
}), {
    name: 'price-store',
}));
exports.default = usePriceStore;
