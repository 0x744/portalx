import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

const SettingsTab: React.FC = () => {
  const [useJito, setUseJito] = useState(false);
  const [jitoTip, setJitoTip] = useState('1000');

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="rpc">RPC</TabsTrigger>
          <TabsTrigger value="bundler">Bundler</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="darkMode"
                  defaultChecked
                />
                <Label htmlFor="darkMode">Dark Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoConnect"
                  defaultChecked
                />
                <Label htmlFor="autoConnect">Auto-connect Wallet</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rpc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RPC Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rpcUrl">RPC URL</Label>
                <Input
                  id="rpcUrl"
                  placeholder="https://api.mainnet-beta.solana.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wsUrl">WebSocket URL</Label>
                <Input
                  id="wsUrl"
                  placeholder="wss://api.mainnet-beta.solana.com"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="useJito"
                  checked={useJito}
                  onCheckedChange={setUseJito}
                />
                <Label htmlFor="useJito">Use Jito</Label>
              </div>
              {useJito && (
                <div className="space-y-2">
                  <Label htmlFor="jitoTip">Jito Tip (lamports)</Label>
                  <Input
                    id="jitoTip"
                    type="number"
                    value={jitoTip}
                    onChange={(e) => setJitoTip(e.target.value)}
                    placeholder="1000"
                  />
                </div>
              )}
              <Button className="w-full">Save RPC Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundler Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxWallets">Maximum Wallets</Label>
                <Input
                  id="maxWallets"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultDelay">Default Delay (ms)</Label>
                <Input
                  id="defaultDelay"
                  type="number"
                  placeholder="100"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoSell"
                  defaultChecked
                />
                <Label htmlFor="autoSell">Auto-sell on Launch</Label>
              </div>
              <Button className="w-full">Save Bundler Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTab; 