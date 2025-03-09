"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const card_1 = require("./card");
const lucide_react_1 = require("lucide-react");
const WalletSummary = () => {
    const [wallets, setWallets] = react_1.default.useState([
        { address: "8xH4jSFhMZKGixQHNMNnJUJAG6QyExLNPV4UqwLUZcnM", balance: 5.2, label: "Main" },
        { address: "9pK7Y6RxJBDGW1vYShdM6RYPGUDRxY59XLrCPHuYtRbZ", balance: 2.8, label: "Trading" },
        { address: "3mR9UwKmUrQEShVbpKZJfEHiR8qrvNkXcQmb8457cPrw", balance: 1.5, label: "Sniper" },
    ]);
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    return (<card_1.Card className="mt-4">
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">Wallet Summary</card_1.CardTitle>
        <lucide_react_1.Wallet className="h-4 w-4 text-muted-foreground"/>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{totalBalance.toFixed(2)} SOL</div>
        <p className="text-xs text-muted-foreground">
          {wallets.length} active wallets
        </p>
      </card_1.CardContent>
    </card_1.Card>);
};
exports.default = WalletSummary;
