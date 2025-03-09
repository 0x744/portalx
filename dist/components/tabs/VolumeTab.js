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
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const tabs_1 = require("@/components/ui/tabs");
const VolumeTab = () => {
    const [buyAmount, setBuyAmount] = (0, react_1.useState)('');
    const [delay, setDelay] = (0, react_1.useState)('1');
    const [wallets, setWallets] = (0, react_1.useState)('5');
    return (<div className="space-y-4">
      <tabs_1.Tabs defaultValue="buy" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-2">
          <tabs_1.TabsTrigger value="buy">Buy</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="sell">Sell</tabs_1.TabsTrigger>
        </tabs_1.TabsList>
        
        <tabs_1.TabsContent value="buy" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Buy Configuration</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="amount">Buy Amount (SOL)</label_1.Label>
                  <input_1.Input id="amount" type="number" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} placeholder="0.1"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="delay">Delay (seconds)</label_1.Label>
                  <input_1.Input id="delay" type="number" value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="1"/>
                </div>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="wallets">Number of Wallets</label_1.Label>
                <input_1.Input id="wallets" type="number" value={wallets} onChange={(e) => setWallets(e.target.value)} placeholder="5"/>
              </div>
              <div className="flex gap-2">
                <button_1.Button className="w-full">Start Buying</button_1.Button>
                <button_1.Button variant="outline" className="w-full">Stop</button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="sell" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Sell Configuration</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="sellAmount">Sell Amount (%)</label_1.Label>
                  <input_1.Input id="sellAmount" type="number" placeholder="100"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="sellDelay">Delay (seconds)</label_1.Label>
                  <input_1.Input id="sellDelay" type="number" placeholder="1"/>
                </div>
              </div>
              <div className="flex gap-2">
                <button_1.Button className="w-full">Start Selling</button_1.Button>
                <button_1.Button variant="outline" className="w-full">Stop</button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
};
exports.default = VolumeTab;
