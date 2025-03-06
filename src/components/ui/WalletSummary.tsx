import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Wallet } from 'lucide-react';

interface WalletInfo {
  address: string;
  balance: number;
  label: string;
}

const WalletSummary: React.FC = () => {
  const [wallets, setWallets] = React.useState<WalletInfo[]>([
    { address: "8xH4jSFhMZKGixQHNMNnJUJAG6QyExLNPV4UqwLUZcnM", balance: 5.2, label: "Main" },
    { address: "9pK7Y6RxJBDGW1vYShdM6RYPGUDRxY59XLrCPHuYtRbZ", balance: 2.8, label: "Trading" },
    { address: "3mR9UwKmUrQEShVbpKZJfEHiR8qrvNkXcQmb8457cPrw", balance: 1.5, label: "Sniper" },
  ]);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wallet Summary</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalBalance.toFixed(2)} SOL</div>
        <p className="text-xs text-muted-foreground">
          {wallets.length} active wallets
        </p>
      </CardContent>
    </Card>
  );
};

export default WalletSummary; 