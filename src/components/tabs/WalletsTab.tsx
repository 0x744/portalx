import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalXWalletManager } from '@/utils/PortalXWalletManager';

const _walletManager = new PortalXWalletManager();

const WalletsTab: React.FC = () => {
  const [walletCount, setWalletCount] = useState('5');
  const [solAmount, setSolAmount] = useState('0.1');
  const [wallets, setWallets] = useState<{ publicKey: string; privateKey: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWallets = () => {
    setIsGenerating(true);
    const worker = new Worker(new URL('@/workers/walletWorker.ts', import.meta.url));
    worker.postMessage({ count: parseInt(walletCount) });
    worker.onmessage = (e) => {
      setWallets(e.data);
      setIsGenerating(false);
      worker.terminate();
    };
  };

  const handleDistributeSOL = async () => {
    // Implement SOL distribution logic
    console.log('Distributing SOL to wallets...');
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="volume" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="volume">Volume Wallets</TabsTrigger>
          <TabsTrigger value="bundler">Bundler Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volume Wallets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="volumeWalletCount">Number of Wallets</Label>
                <Input
                  id="volumeWalletCount"
                  type="number"
                  value={walletCount}
                  onChange={(e) => setWalletCount(e.target.value)}
                  placeholder="5"
                />
                <Button 
                  className="w-full" 
                  onClick={handleGenerateWallets}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Wallets'}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="solAmount">SOL Amount per Wallet</Label>
                <Input
                  id="solAmount"
                  type="number"
                  value={solAmount}
                  onChange={(e) => setSolAmount(e.target.value)}
                  placeholder="0.1"
                />
                <Button className="w-full" onClick={handleDistributeSOL}>
                  Distribute SOL
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Wallet Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">Check Balances</Button>
                  <Button variant="outline">Close Token Accounts</Button>
                  <Button variant="outline">Send SOL</Button>
                  <Button variant="outline">Return to Main</Button>
                </div>
              </div>
              {wallets.length > 0 && (
                <div className="space-y-2">
                  <Label>Generated Wallets</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {wallets.map((wallet, index) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <p className="text-sm">Public Key: {wallet.publicKey.slice(0, 10)}...</p>
                        <p className="text-sm">Private Key: {wallet.privateKey.slice(0, 10)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundler Wallets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bundlerWalletCount">Number of Wallets (Max 20)</Label>
                <Input
                  id="bundlerWalletCount"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="5"
                />
                <Button className="w-full">Generate Wallets</Button>
              </div>
              <div className="space-y-2">
                <Label>Wallet Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">Check Balances</Button>
                  <Button variant="outline">Close Token Accounts</Button>
                  <Button variant="outline">Transfer SPL</Button>
                  <Button variant="outline">Return to Main</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletsTab; 