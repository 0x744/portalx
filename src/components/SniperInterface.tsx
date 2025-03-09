import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Zap, AlertTriangle } from 'lucide-react';

interface Target {
  address: string;
  buyAmount: number;
  maxPrice: number;
  detectMigration: boolean;
  status: string;
}

export const SniperInterface: React.FC = () => {
  const [targetAddress, setTargetAddress] = useState("");
  const [buyAmount, setBuyAmount] = useState("0.1");
  const [maxPrice, setMaxPrice] = useState("0.001");
  const [detectMigration, setDetectMigration] = useState(true);
  const [_slippage, _setSlippage] = useState(1);
  const [targets, setTargets] = useState<Target[]>([
    { 
      address: "7KqpU9VEZNVw8YBRKZxnfGfuYQwUkUZ9dBGdq4qYX2UZ", 
      buyAmount: 0.2, 
      maxPrice: 0.0015, 
      detectMigration: true,
      status: "Monitoring"
    },
    { 
      address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", 
      buyAmount: 0.5, 
      maxPrice: 0.002, 
      detectMigration: false,
      status: "Pending"
    }
  ]);

  const addTarget = () => {
    if (targetAddress) {
      setTargets([
        ...targets, 
        { 
          address: targetAddress, 
          buyAmount: parseFloat(buyAmount), 
          maxPrice: parseFloat(maxPrice), 
          detectMigration,
          status: "Monitoring"
        }
      ]);
      setTargetAddress("");
    }
  };

  const removeTarget = (address: string) => {
    setTargets(targets.filter((target) => target.address !== address));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5 text-primary" />
          Sniper System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="configure">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="targets">Active Targets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAddress">Target Address</Label>
              <Input
                id="targetAddress"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="Enter token address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyAmount">Buy Amount (SOL)</Label>
              <Input
                id="buyAmount"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="Enter buy amount"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price (SOL)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Enter max price"
                step="0.000001"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="detectMigration"
                checked={detectMigration}
                onChange={(e) => setDetectMigration(e.target.checked)}
              />
              <Label htmlFor="detectMigration">Detect Migration</Label>
            </div>
            <Button onClick={addTarget} className="w-full">
              Add Target
            </Button>
          </TabsContent>
          
          <TabsContent value="targets">
            <div className="space-y-4">
              {targets.map((target) => (
                <Card key={target.address}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{target.address}</p>
                        <p className="text-sm text-muted-foreground">
                          Buy: {target.buyAmount} SOL | Max: {target.maxPrice} SOL
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          target.status === "Monitoring" ? "text-green-500" : "text-yellow-500"
                        }`}>
                          {target.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTarget(target.address)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-900/30 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-500">Important Notice</p>
            <p className="text-muted-foreground">
              The sniper system executes transactions automatically. Please ensure you have sufficient SOL in your wallets and have set appropriate parameters.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 