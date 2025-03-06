import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Minus, Square, X, RotateCw } from 'lucide-react';

const TopBar: React.FC = () => {
  const [solPrice, setSolPrice] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);

  const fetchSolanaPrice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const data = await response.json();
      setSolPrice(data.solana.usd.toFixed(2));
    } catch (error) {
      console.error("Error fetching Solana price:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const intervalId = setInterval(fetchSolanaPrice, 30000);
    fetchSolanaPrice();
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="h-8 bg-black border-b border-border flex items-center justify-between px-4 select-none">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <span className="text-primary font-semibold">PortalX</span>
          <span className="text-muted-foreground ml-2 text-sm">1.0.0</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">1 SOL = ${solPrice} USD</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchSolanaPrice} disabled={isLoading}>
            <RotateCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Minus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Square className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 