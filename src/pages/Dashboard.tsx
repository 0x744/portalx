import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PortalXBlockchainClient } from '../utils/PortalXBlockchainClient';
import { PortalXWalletManager } from '../utils/PortalXWalletManager';

const Dashboard: React.FC = () => {
  const [totalWallets, setTotalWallets] = React.useState(0);
  const [totalBalance, setTotalBalance] = React.useState(0);
  const [recentTransactions, setRecentTransactions] = React.useState<any[]>([]);
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const client = new PortalXBlockchainClient();
  const walletManager = new PortalXWalletManager();

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load wallets
      const wallets = await walletManager.getWallets();
      setTotalWallets(wallets.length);

      // Calculate total balance
      const balances = await Promise.all(
        wallets.map(wallet => client.getBalance(wallet.publicKey))
      );
      const total = balances.reduce((sum, balance) => sum + balance, 0);
      setTotalBalance(total);

      // Load recent transactions
      if (wallets.length > 0) {
        const transactions = await client.getRecentTransactions(wallets[0].publicKey, 5);
        setRecentTransactions(transactions);
      }

      setStatus('Dashboard data loaded successfully');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      setStatus('Failed to load dashboard data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWallets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBalance.toFixed(4)} SOL</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx, index) => (
              <div
                key={tx.signature}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="space-y-1">
                  <div className="font-mono text-sm">
                    {tx.signature.slice(0, 8)}...
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Status: {tx.status}
                  </div>
                </div>
                {tx.error && (
                  <div className="text-sm text-red-500">
                    {tx.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Dashboard; 