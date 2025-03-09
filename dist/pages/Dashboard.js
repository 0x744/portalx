"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const card_1 = require("../components/ui/card");
const PortalXBlockchainClient_1 = require("../utils/PortalXBlockchainClient");
const PortalXWalletManager_1 = require("../utils/PortalXWalletManager");
const Dashboard = () => {
    const [totalWallets, setTotalWallets] = react_1.default.useState(0);
    const [totalBalance, setTotalBalance] = react_1.default.useState(0);
    const [recentTransactions, setRecentTransactions] = react_1.default.useState([]);
    const [status, setStatus] = react_1.default.useState('');
    const [error, setError] = react_1.default.useState(null);
    const client = new PortalXBlockchainClient_1.PortalXBlockchainClient();
    const walletManager = new PortalXWalletManager_1.PortalXWalletManager();
    react_1.default.useEffect(() => {
        loadDashboardData();
    }, []);
    const loadDashboardData = async () => {
        try {
            // Load wallets
            const wallets = await walletManager.getWallets();
            setTotalWallets(wallets.length);
            // Calculate total balance
            const balances = await Promise.all(wallets.map(wallet => client.getBalance(wallet.publicKey)));
            const total = balances.reduce((sum, balance) => sum + balance, 0);
            setTotalBalance(total);
            // Load recent transactions
            if (wallets.length > 0) {
                const transactions = await client.getRecentTransactions(wallets[0].publicKey, 5);
                setRecentTransactions(transactions);
            }
            setStatus('Dashboard data loaded successfully');
            setError(null);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
            setError(errorMessage);
            setStatus('Failed to load dashboard data');
        }
    };
    return (<div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Total Wallets</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-3xl font-bold">{totalWallets}</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Total Balance</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-3xl font-bold">{totalBalance.toFixed(4)} SOL</div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Recent Transactions</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx, index) => (<div key={tx.signature} className="flex items-center justify-between p-2 border rounded-md">
                <div className="space-y-1">
                  <div className="font-mono text-sm">
                    {tx.signature.slice(0, 8)}...
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Status: {tx.status}
                  </div>
                </div>
                {tx.error && (<div className="text-sm text-red-500">
                    {tx.error}
                  </div>)}
              </div>))}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {status && (<div className="text-sm text-muted-foreground">
          {status}
        </div>)}

      {error && (<div className="text-sm text-red-500">
          {error}
        </div>)}
    </div>);
};
exports.default = Dashboard;
