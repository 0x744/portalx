"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const card_1 = require("../components/ui/card");
const input_1 = require("../components/ui/input");
const label_1 = require("../components/ui/label");
const button_1 = require("../components/ui/button");
const lucide_react_1 = require("lucide-react");
const Wallets = () => {
    const [wallets, setWallets] = (0, react_1.useState)([
        { address: "8xH4jSFhMZKGixQHNMNnJUJAG6QyExLNPV4UqwLUZcnM", balance: 5.2, label: "Main" },
        { address: "9pK7Y6RxJBDGW1vYShdM6RYPGUDRxY59XLrCPHuYtRbZ", balance: 2.8, label: "Trading" },
        { address: "3mR9UwKmUrQEShVbpKZJfEHiR8qrvNkXcQmb8457cPrw", balance: 1.5, label: "Sniper" },
    ]);
    const [newWalletLabel, setNewWalletLabel] = (0, react_1.useState)("");
    const addWallet = () => {
        // TODO: Implement wallet creation logic
        const newWallet = {
            address: "New Wallet Address", // This should be generated
            balance: 0,
            label: newWalletLabel || "New Wallet"
        };
        setWallets([...wallets, newWallet]);
        setNewWalletLabel("");
    };
    const removeWallet = (address) => {
        setWallets(wallets.filter(wallet => wallet.address !== address));
    };
    const copyAddress = (address) => {
        navigator.clipboard.writeText(address);
    };
    return (<div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet Management</h1>
      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Wallet className="mr-2 h-5 w-5 text-primary"/>
            Your Wallets
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label_1.Label htmlFor="newWalletLabel">New Wallet Label</label_1.Label>
                <input_1.Input id="newWalletLabel" value={newWalletLabel} onChange={(e) => setNewWalletLabel(e.target.value)} placeholder="Enter wallet label"/>
              </div>
              <button_1.Button onClick={addWallet} className="mt-6">
                Add Wallet
              </button_1.Button>
            </div>

            <div className="space-y-4">
              {wallets.map((wallet) => (<card_1.Card key={wallet.address}>
                  <card_1.CardContent className="pt-6">
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
                        <button_1.Button variant="ghost" size="icon" onClick={() => copyAddress(wallet.address)}>
                          <lucide_react_1.Copy className="h-4 w-4"/>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="icon" onClick={() => removeWallet(wallet.address)}>
                          <lucide_react_1.Trash2 className="h-4 w-4"/>
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>))}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
exports.default = Wallets;
