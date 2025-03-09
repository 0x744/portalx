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
const switch_1 = require("@/components/ui/switch");
const SettingsTab = () => {
    const [useJito, setUseJito] = (0, react_1.useState)(false);
    const [jitoTip, setJitoTip] = (0, react_1.useState)('1000');
    return (<div className="space-y-4">
      <tabs_1.Tabs defaultValue="general" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="general">General</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="rpc">RPC</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="bundler">Bundler</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="general" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>General Settings</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <switch_1.Switch id="darkMode" defaultChecked/>
                <label_1.Label htmlFor="darkMode">Dark Mode</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <switch_1.Switch id="autoConnect" defaultChecked/>
                <label_1.Label htmlFor="autoConnect">Auto-connect Wallet</label_1.Label>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="rpc" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>RPC Configuration</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="rpcUrl">RPC URL</label_1.Label>
                <input_1.Input id="rpcUrl" placeholder="https://api.mainnet-beta.solana.com"/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="wsUrl">WebSocket URL</label_1.Label>
                <input_1.Input id="wsUrl" placeholder="wss://api.mainnet-beta.solana.com"/>
              </div>
              <div className="flex items-center space-x-2">
                <switch_1.Switch id="useJito" checked={useJito} onCheckedChange={setUseJito}/>
                <label_1.Label htmlFor="useJito">Use Jito</label_1.Label>
              </div>
              {useJito && (<div className="space-y-2">
                  <label_1.Label htmlFor="jitoTip">Jito Tip (lamports)</label_1.Label>
                  <input_1.Input id="jitoTip" type="number" value={jitoTip} onChange={(e) => setJitoTip(e.target.value)} placeholder="1000"/>
                </div>)}
              <button_1.Button className="w-full">Save RPC Settings</button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="bundler" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Bundler Settings</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="maxWallets">Maximum Wallets</label_1.Label>
                <input_1.Input id="maxWallets" type="number" min="1" max="20" placeholder="20"/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="defaultDelay">Default Delay (ms)</label_1.Label>
                <input_1.Input id="defaultDelay" type="number" placeholder="100"/>
              </div>
              <div className="flex items-center space-x-2">
                <switch_1.Switch id="autoSell" defaultChecked/>
                <label_1.Label htmlFor="autoSell">Auto-sell on Launch</label_1.Label>
              </div>
              <button_1.Button className="w-full">Save Bundler Settings</button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
};
exports.default = SettingsTab;
