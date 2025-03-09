import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Wallet, Copy, Trash2 } from 'lucide-react';

interface WalletInfo {
  address: string;
  balance: number;
  label: string;
}

const Wallets: React.FC = () => {
  const [wallets, setWallets] = useState<WalletInfo[]>([
    { address: "8xH4jSFhMZKGixQHNMNnJUJAG6QyExLNPV4UqwLUZcnM", balance: 5.2, label: "Main" },
    { address: "9pK7Y6RxJBDGW1vYShdM6RYPGUDRxY59XLrCPHuYtRbZ", balance: 2.8, label: "Trading" },
    { address: "3mR9UwKmUrQEShVbpKZJfEHiR8qrvNkXcQmb8457cPrw", balance: 1.5, label: "Sniper" },
  ]);
  const [newWalletLabel, setNewWalletLabel] = useState("");

  const addWallet = () => {
    // TODO: Implement wallet creation logic
    const newWallet: WalletInfo = {
      address: "New Wallet Address", // This should be generated
      balance: 0,
      label: newWalletLabel || "New Wallet"
    };
    setWallets([...wallets, newWallet]);
    setNewWalletLabel("");
  };

  const removeWallet = (address: string) => {
    setWallets(wallets.filter(wallet => wallet.address !== address));
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-primary" />
            Your Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="newWalletLabel">New Wallet Label</Label>
                <Input
                  id="newWalletLabel"
                  value={newWalletLabel}
                  onChange={(e) => setNewWalletLabel(e.target.value)}
                  placeholder="Enter wallet label"
                />
              </div>
              <Button onClick={addWallet} className="mt-6">
                Add Wallet
              </Button>
            </div>

            <div className="space-y-4">
              {wallets.map((wallet) => (
                <Card key={wallet.address}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{wallet.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {wallet.address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: {wallet.balance} SOL
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyAddress(wallet.address)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWallet(wallet.address)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallets; 