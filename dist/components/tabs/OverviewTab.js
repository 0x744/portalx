"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const OverviewTab = () => {
    return (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Total Volume</card_1.CardTitle>
          <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground">
            +0% from last 24h
          </p>
        </card_1.CardContent>
      </card_1.Card>
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Active Wallets</card_1.CardTitle>
          <lucide_react_1.Wallet className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Connected wallets
          </p>
        </card_1.CardContent>
      </card_1.Card>
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Token Balance</card_1.CardTitle>
          <lucide_react_1.Coins className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Total tokens across wallets
          </p>
        </card_1.CardContent>
      </card_1.Card>
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Settings</card_1.CardTitle>
          <lucide_react_1.Settings className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">
            Configure your preferences
          </p>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
exports.default = OverviewTab;
