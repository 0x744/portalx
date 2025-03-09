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
const PortalXWalletManager_1 = require("@/utils/PortalXWalletManager");
const WalletsTab = () => {
    const [walletCount, setWalletCount] = (0, react_1.useState)('5');
    const [solAmount, setSolAmount] = (0, react_1.useState)('0.1');
    const [wallets, setWallets] = (0, react_1.useState)([]);
    const [isGenerating, setIsGenerating] = (0, react_1.useState)(false);
    const handleGenerateWallets = () => {
        setIsGenerating(true);
        const worker = new Worker(new URL('@/workers/walletWorker.ts', import.meta.url));
        worker.postMessage({ count: parseInt(walletCount) });
        worker.onmessage = (e) => {
            setWallets(e.data);
            setIsGenerating(false);
            worker.terminate();
        };
    };
    const handleDistributeSOL = async () => {
        const walletManager = new PortalXWalletManager_1.PortalXWalletManager();
        try {
            for (const wallet of wallets) {
                await walletManager.distributeSOL(wallet.publicKey, parseFloat(solAmount));
            }
            console.log('SOL distribution completed');
        }
        catch (error) {
            console.error('Failed to distribute SOL:', error);
        }
    };
    return (<div className="space-y-4">
      <tabs_1.Tabs defaultValue="volume" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-2">
          <tabs_1.TabsTrigger value="volume">Volume Wallets</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="bundler">Bundler Wallets</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="volume" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Volume Wallets</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="volumeWalletCount">Number of Wallets</label_1.Label>
                <input_1.Input id="volumeWalletCount" type="number" value={walletCount} onChange={(e) => setWalletCount(e.target.value)} placeholder="5"/>
                <button_1.Button className="w-full" onClick={handleGenerateWallets} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Wallets'}
                </button_1.Button>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="solAmount">SOL Amount per Wallet</label_1.Label>
                <input_1.Input id="solAmount" type="number" value={solAmount} onChange={(e) => setSolAmount(e.target.value)} placeholder="0.1"/>
                <button_1.Button className="w-full" onClick={handleDistributeSOL}>
                  Distribute SOL
                </button_1.Button>
              </div>
              <div className="space-y-2">
                <label_1.Label>Wallet Actions</label_1.Label>
                <div className="grid grid-cols-2 gap-2">
                  <button_1.Button variant="outline">Check Balances</button_1.Button>
                  <button_1.Button variant="outline">Close Token Accounts</button_1.Button>
                  <button_1.Button variant="outline">Send SOL</button_1.Button>
                  <button_1.Button variant="outline">Return to Main</button_1.Button>
                </div>
              </div>
              {wallets.length > 0 && (<div className="space-y-2">
                  <label_1.Label>Generated Wallets</label_1.Label>
                  <div className="grid grid-cols-1 gap-2">
                    {wallets.map((wallet, index) => (<div key={index} className="p-2 bg-muted rounded">
                        <p className="text-sm">Public Key: {wallet.publicKey.slice(0, 10)}...</p>
                        <p className="text-sm">Private Key: {wallet.privateKey.slice(0, 10)}...</p>
                      </div>))}
                  </div>
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="bundler" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Bundler Wallets</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="bundlerWalletCount">Number of Wallets (Max 20)</label_1.Label>
                <input_1.Input id="bundlerWalletCount" type="number" min="1" max="20" placeholder="5"/>
                <button_1.Button className="w-full">Generate Wallets</button_1.Button>
              </div>
              <div className="space-y-2">
                <label_1.Label>Wallet Actions</label_1.Label>
                <div className="grid grid-cols-2 gap-2">
                  <button_1.Button variant="outline">Check Balances</button_1.Button>
                  <button_1.Button variant="outline">Close Token Accounts</button_1.Button>
                  <button_1.Button variant="outline">Transfer SPL</button_1.Button>
                  <button_1.Button variant="outline">Return to Main</button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
};
exports.default = WalletsTab;
