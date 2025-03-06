import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useState } from 'react';

interface PriceData {
  price: number;
  timestamp: number;
  volume24h: number;
  priceChange24h: number;
}

interface PriceState {
  priceData: PriceData[];
  isLoading: boolean;
  error: string | null;
  fetchPrice: () => Promise<void>;
  fetchHistoricalData: (days: number) => Promise<void>;
}

const usePriceStore = create<PriceState>()(
  devtools(
    (set, get) => ({
      priceData: [],
      isLoading: false,
      error: null,

      fetchPrice: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true'
          );
          const data = await response.json();
          
          const newPriceData: PriceData = {
            price: data.solana.usd,
            timestamp: Date.now(),
            volume24h: data.solana.usd_24h_vol,
            priceChange24h: data.solana.usd_24h_change,
          };

          set((state) => ({
            priceData: [...state.priceData, newPriceData].slice(-100), // Keep last 100 data points
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch price data',
            isLoading: false 
          });
        }
      },

      fetchHistoricalData: async (days: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${days}`
          );
          const data = await response.json();
          
          const historicalData: PriceData[] = data.prices.map(([timestamp, price]: [number, number]) => ({
            price,
            timestamp,
            volume24h: 0, // Historical volume data not available in this endpoint
            priceChange24h: 0,
          }));

          set({ 
            priceData: historicalData,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch historical data',
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'price-store',
    }
  )
);

export default usePriceStore; 