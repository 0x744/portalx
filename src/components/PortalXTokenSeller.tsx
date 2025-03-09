import React, { useState, useEffect } from 'react';
import { Coins, ArrowDownRight, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { PortalXBlockchainClient } from '../utils/PortalXBlockchainClient';
import { PortalXQueueManager } from '../utils/PortalXQueueManager';
import { PortalXWalletManager } from '../utils/PortalXWalletManager';
import { PortalXValidation } from '../utils/PortalXValidation';
import { PublicKey } from '@solana/web3.js';

const client = new PortalXBlockchainClient();
const walletManager = new PortalXWalletManager();
const queueManager = new PortalXQueueManager(client);
const validation = new PortalXValidation();

// WARNING: Using testnet configuration
const _TOKEN_MINT = new PublicKey('your-token-mint-address');

interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  balance: number;
  price: number;
}

const PortalXTokenSeller: React.FC = () => {
  const [tokenMint, setTokenMint] = useState('');
  const [sellAmount, setSellAmount] = useState<number>(0);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(1);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [wallets, setWallets] = useState<Array<{ publicKey: string; label: string }>>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [status, setStatus] = useState('');
  const [isSelling, setIsSelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    if (tokenMint) {
      loadTokenInfo();
    }
  }, [tokenMint]);

  const loadWallets = async () => {
    try {
      const loadedWallets = await walletManager.getWallets();
      setWallets(loadedWallets.map(w => ({ publicKey: w.publicKey, label: w.label })));
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load wallets';
      setError(errorMessage);
      setStatus('Failed to load wallets');
    }
  };

  const loadTokenInfo = async () => {
    try {
      const info = await client.getTokenInfo(tokenMint);
      const balance = await client.getBalance(tokenMint);
      const price = await client.getTokenPrice(tokenMint);
      
      setTokenInfo({
        ...info,
        balance,
        price
      });
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load token info';
      setError(errorMessage);
      setStatus('Failed to load token info');
    }
  };

  const handleSell = async () => {
    if (!validation.validateAmount(sellAmount) || !validation.validateAmount(targetPrice)) {
      setError('Invalid amount or price');
      setStatus('Invalid amount or price');
      return;
    }

    if (!selectedWallet) {
      setError('Please select a wallet');
      setStatus('Please select a wallet');
      return;
    }

    try {
      setIsSelling(true);
      setStatus('Initiating sell...');
      setError(null);

      const result = await queueManager.createSellTransaction(
        selectedWallet,
        tokenMint,
        sellAmount,
        targetPrice,
        slippage
      );

      setStatus(`Sell transaction created: ${result}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setStatus(`Sell failed: ${errorMessage}`);
    } finally {
      setIsSelling(false);
    }
  };

  const handleStopSell = () => {
    setIsSelling(false);
    setStatus('Sell operation stopped');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Seller
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Token Mint Address</Label>
            <Input
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              placeholder="Enter token mint address"
            />
          </div>

          {tokenInfo && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Token Balance</Label>
                <div className="text-lg font-mono">
                  {tokenInfo.balance.toLocaleString()} {tokenInfo.symbol}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Price</Label>
                <div className="text-lg font-mono">
                  {tokenInfo.price.toFixed(6)} SOL
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Wallet</Label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet.publicKey} value={wallet.publicKey}>
                  {wallet.label || wallet.publicKey}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Sell Amount ({tokenInfo?.symbol || 'TOKEN'})</Label>
            <Input
              type="number"
              value={sellAmount}
              onChange={(e) => setSellAmount(Number(e.target.value))}
              min={0}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Price (SOL)</Label>
            <Input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              min={0}
              step={0.000001}
            />
          </div>

          <div className="space-y-2">
            <Label>Slippage (%)</Label>
            <div className="flex gap-2">
              <Slider
                value={[slippage]}
                onValueChange={(values: number[]) => setSlippage(values[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="flex-1"
              />
              <div className="w-12 text-sm">{slippage}%</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSell}
              disabled={isSelling || !tokenMint || !selectedWallet}
              className="flex-1"
            >
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Sell Token
            </Button>
            <Button
              onClick={handleStopSell}
              disabled={!isSelling}
              variant="destructive"
              className="flex-1"
            >
              <Timer className="mr-2 h-4 w-4" />
              Stop Sell
            </Button>
          </div>

          {status && (
            <div className="text-sm text-muted-foreground">
              {status}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalXTokenSeller; 