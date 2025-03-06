import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VolumeTab: React.FC = () => {
  const [buyAmount, setBuyAmount] = useState('');
  const [delay, setDelay] = useState('1');
  const [wallets, setWallets] = useState('5');

  return (
    <div className="space-y-4">
      <Tabs defaultValue="buy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buy Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Buy Amount (SOL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (seconds)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={delay}
                    onChange={(e) => setDelay(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallets">Number of Wallets</Label>
                <Input
                  id="wallets"
                  type="number"
                  value={wallets}
                  onChange={(e) => setWallets(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div className="flex gap-2">
                <Button className="w-full">Start Buying</Button>
                <Button variant="outline" className="w-full">Stop</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sell Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellAmount">Sell Amount (%)</Label>
                  <Input
                    id="sellAmount"
                    type="number"
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellDelay">Delay (seconds)</Label>
                  <Input
                    id="sellDelay"
                    type="number"
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="w-full">Start Selling</Button>
                <Button variant="outline" className="w-full">Stop</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VolumeTab; 