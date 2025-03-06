import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

const BundlerTab: React.FC = () => {
  const [safeMode, setSafeMode] = useState(true);
  const [experimentalMode, setExperimentalMode] = useState(false);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="launch" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="launch">Launch</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="launch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Launch Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    placeholder="My Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol">Token Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    placeholder="MTK"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supply">Total Supply</Label>
                <Input
                  id="supply"
                  type="number"
                  placeholder="1000000000"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="safeMode"
                  checked={safeMode}
                  onCheckedChange={setSafeMode}
                />
                <Label htmlFor="safeMode">Safe Mode (Same-block purchases)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="experimentalMode"
                  checked={experimentalMode}
                  onCheckedChange={setExperimentalMode}
                />
                <Label htmlFor="experimentalMode">Experimental Mode (Hide from graphs)</Label>
              </div>
              <Button className="w-full">Launch Token</Button>
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
                  <Label htmlFor="sellMode">Sell Mode</Label>
                  <select
                    id="sellMode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="dumpAll">Dump All</option>
                    <option value="dumpAllPercent">Dump All %</option>
                    <option value="singleSell">Single Sell</option>
                    <option value="raydiumDumpAll">Raydium Dump All</option>
                    <option value="raydiumSingleSell">Raydium Single Sell</option>
                    <option value="sendSpl">Send SPL</option>
                    <option value="devSell">Dev Sell</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellAmount">Amount (%)</Label>
                  <Input
                    id="sellAmount"
                    type="number"
                    placeholder="100"
                  />
                </div>
              </div>
              <Button className="w-full">Execute Sell</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cloneToken">Clone Token Address</Label>
                <Input
                  id="cloneToken"
                  placeholder="Enter token address to clone"
                />
                <Button className="w-full">Clone Token</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="holderCount">Number of Holders</Label>
                <Input
                  id="holderCount"
                  type="number"
                  placeholder="100"
                />
                <Button className="w-full">Generate Holders</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BundlerTab; 