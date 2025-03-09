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
const lucide_react_1 = require("lucide-react");
const button_1 = require("./ui/button");
const input_1 = require("./ui/input");
const card_1 = require("./ui/card");
const label_1 = require("./ui/label");
const slider_1 = require("./ui/slider");
const PortalXBlockchainClient_1 = require("../utils/PortalXBlockchainClient");
const PortalXQueueManager_1 = require("../utils/PortalXQueueManager");
const PortalXWalletManager_1 = require("../utils/PortalXWalletManager");
const PortalXValidation_1 = require("../utils/PortalXValidation");
const web3_js_1 = require("@solana/web3.js");
const client = new PortalXBlockchainClient_1.PortalXBlockchainClient();
const walletManager = new PortalXWalletManager_1.PortalXWalletManager();
const queueManager = new PortalXQueueManager_1.PortalXQueueManager(client);
const validation = new PortalXValidation_1.PortalXValidation();
// WARNING: Using testnet configuration
const _TOKEN_MINT = new web3_js_1.PublicKey('your-token-mint-address');
const PortalXTokenSeller = () => {
    const [tokenMint, setTokenMint] = (0, react_1.useState)('');
    const [sellAmount, setSellAmount] = (0, react_1.useState)(0);
    const [targetPrice, setTargetPrice] = (0, react_1.useState)(0);
    const [slippage, setSlippage] = (0, react_1.useState)(1);
    const [selectedWallet, setSelectedWallet] = (0, react_1.useState)('');
    const [wallets, setWallets] = (0, react_1.useState)([]);
    const [tokenInfo, setTokenInfo] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)('');
    const [isSelling, setIsSelling] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadWallets();
    }, []);
    (0, react_1.useEffect)(() => {
        if (tokenMint) {
            loadTokenInfo();
        }
    }, [tokenMint]);
    const loadWallets = async () => {
        try {
            const loadedWallets = await walletManager.getWallets();
            setWallets(loadedWallets.map(w => ({ publicKey: w.publicKey, label: w.label })));
            setError(null);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load wallets';
            setError(errorMessage);
            setStatus('Failed to load wallets');
        }
    };
    const loadTokenInfo = async () => {
        try {
            const info = await client.getTokenInfo(tokenMint);
            const balance = await client.getBalance(tokenMint);
            const price = await client.getTokenPrice(tokenMint);
            setTokenInfo({
                ...info,
                balance,
                price
            });
            setError(null);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load token info';
            setError(errorMessage);
            setStatus('Failed to load token info');
        }
    };
    const handleSell = async () => {
        if (!validation.validateAmount(sellAmount) || !validation.validateAmount(targetPrice)) {
            setError('Invalid amount or price');
            setStatus('Invalid amount or price');
            return;
        }
        if (!selectedWallet) {
            setError('Please select a wallet');
            setStatus('Please select a wallet');
            return;
        }
        try {
            setIsSelling(true);
            setStatus('Initiating sell...');
            setError(null);
            const result = await queueManager.createSellTransaction(selectedWallet, tokenMint, sellAmount, targetPrice, slippage);
            setStatus(`Sell transaction created: ${result}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            setStatus(`Sell failed: ${errorMessage}`);
        }
        finally {
            setIsSelling(false);
        }
    };
    const handleStopSell = () => {
        setIsSelling(false);
        setStatus('Sell operation stopped');
        setError(null);
    };
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Coins className="h-5 w-5"/>
            Token Seller
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="space-y-2">
            <label_1.Label>Token Mint Address</label_1.Label>
            <input_1.Input value={tokenMint} onChange={(e) => setTokenMint(e.target.value)} placeholder="Enter token mint address"/>
          </div>

          {tokenInfo && (<div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label_1.Label>Token Balance</label_1.Label>
                <div className="text-lg font-mono">
                  {tokenInfo.balance.toLocaleString()} {tokenInfo.symbol}
                </div>
              </div>
              <div className="space-y-2">
                <label_1.Label>Current Price</label_1.Label>
                <div className="text-lg font-mono">
                  {tokenInfo.price.toFixed(6)} SOL
                </div>
              </div>
            </div>)}

          <div className="space-y-2">
            <label_1.Label>Select Wallet</label_1.Label>
            <select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="">Select a wallet</option>
              {wallets.map((wallet) => (<option key={wallet.publicKey} value={wallet.publicKey}>
                  {wallet.label || wallet.publicKey}
                </option>))}
            </select>
          </div>

          <div className="space-y-2">
            <label_1.Label>Sell Amount ({tokenInfo?.symbol || 'TOKEN'})</label_1.Label>
            <input_1.Input type="number" value={sellAmount} onChange={(e) => setSellAmount(Number(e.target.value))} min={0} step={1}/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Target Price (SOL)</label_1.Label>
            <input_1.Input type="number" value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value))} min={0} step={0.000001}/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Slippage (%)</label_1.Label>
            <div className="flex gap-2">
              <slider_1.Slider value={[slippage]} onValueChange={(values) => setSlippage(values[0])} min={0.1} max={5} step={0.1} className="flex-1"/>
              <div className="w-12 text-sm">{slippage}%</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button_1.Button onClick={handleSell} disabled={isSelling || !tokenMint || !selectedWallet} className="flex-1">
              <lucide_react_1.ArrowDownRight className="mr-2 h-4 w-4"/>
              Sell Token
            </button_1.Button>
            <button_1.Button onClick={handleStopSell} disabled={!isSelling} variant="destructive" className="flex-1">
              <lucide_react_1.Timer className="mr-2 h-4 w-4"/>
              Stop Sell
            </button_1.Button>
          </div>

          {status && (<div className="text-sm text-muted-foreground">
              {status}
            </div>)}

          {error && (<div className="text-sm text-red-500">
              {error}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
exports.default = PortalXTokenSeller;
