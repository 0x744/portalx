"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const card_1 = require("../components/ui/card");
const label_1 = require("../components/ui/label");
const input_1 = require("../components/ui/input");
const button_1 = require("../components/ui/button");
const PortalXValidation_1 = require("../utils/PortalXValidation");
const PortalXBlockchainClient_1 = require("../utils/PortalXBlockchainClient");
const Settings = () => {
    const [rpcUrl, setRpcUrl] = react_1.default.useState('https://api.mainnet-beta.solana.com');
    const [jitoUrl, setJitoUrl] = react_1.default.useState('https://mainnet.jito.wtf');
    const [maxWallets, setMaxWallets] = react_1.default.useState(100);
    const [defaultTip, setDefaultTip] = react_1.default.useState(0.005);
    const [status, setStatus] = react_1.default.useState('');
    const [error, setError] = react_1.default.useState(null);
    const handleSave = async () => {
        try {
            if (!PortalXValidation_1.PortalXValidation.isValidRpcUrl(rpcUrl)) {
                setError('Invalid RPC URL');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidUrl(jitoUrl)) {
                setError('Invalid Jito URL');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidWalletCount(maxWallets)) {
                setError('Invalid wallet count');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidSwapAmount(defaultTip)) {
                setError('Invalid tip amount');
                return;
            }
            // Save settings to localStorage
            localStorage.setItem('portalx_settings', JSON.stringify({
                rpcUrl,
                jitoUrl,
                maxWallets,
                defaultTip
            }));
            // Test connection
            const client = new PortalXBlockchainClient_1.PortalXBlockchainClient([rpcUrl]);
            await client.getActiveConnection();
            setStatus('Settings saved successfully');
            setError(null);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
            setError(errorMessage);
            setStatus('Failed to save settings');
        }
    };
    react_1.default.useEffect(() => {
        // Load saved settings
        const savedSettings = localStorage.getItem('portalx_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                setRpcUrl(settings.rpcUrl);
                setJitoUrl(settings.jitoUrl);
                setMaxWallets(settings.maxWallets);
                setDefaultTip(settings.defaultTip);
            }
            catch (error) {
                setError('Failed to load settings');
            }
        }
    }, []);
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Settings</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="space-y-2">
            <label_1.Label>RPC URL</label_1.Label>
            <input_1.Input value={rpcUrl} onChange={(e) => setRpcUrl(e.target.value)} placeholder="Enter RPC URL"/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Jito URL</label_1.Label>
            <input_1.Input value={jitoUrl} onChange={(e) => setJitoUrl(e.target.value)} placeholder="Enter Jito URL"/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Max Wallets</label_1.Label>
            <input_1.Input type="number" value={maxWallets} onChange={(e) => setMaxWallets(Number(e.target.value))} min={1} max={1000} step={1}/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Default Tip (SOL)</label_1.Label>
            <input_1.Input type="number" value={defaultTip} onChange={(e) => setDefaultTip(Number(e.target.value))} min={0} max={1} step={0.001}/>
          </div>

          <button_1.Button onClick={handleSave}>
            Save Settings
          </button_1.Button>

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
exports.default = Settings;
