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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const button_1 = require("./ui/button");
const input_1 = require("./ui/input");
const label_1 = require("./ui/label");
const card_1 = require("./ui/card");
const PortalXBlockchainClient_1 = require("../utils/PortalXBlockchainClient");
const PortalXValidation_1 = require("../utils/PortalXValidation");
const speakeasy_1 = __importDefault(require("speakeasy"));
const DEFAULT_CONFIG = {
    rpcUrls: [
        'https://api.devnet.solana.com',
        'https://api.testnet.solana.com',
        'https://api.mainnet-beta.solana.com'
    ],
    jitoUrl: 'https://mainnet.jito.wtf',
    otpSecret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
    theme: 'dark',
    maxWallets: 1000,
    defaultTip: 0.005
};
// Memoized RPC URL input component
const RpcUrlInput = (0, react_1.memo)(({ url, index, onChange }) => (<div className="space-y-2">
    <label_1.Label htmlFor={`rpc-url-${index}`}>RPC URL {index + 1}</label_1.Label>
    <input_1.Input id={`rpc-url-${index}`} value={url} onChange={(e) => onChange(index, e.target.value)} placeholder="Enter RPC URL" aria-label={`RPC URL ${index + 1}`}/>
  </div>));
RpcUrlInput.displayName = 'RpcUrlInput';
// Memoized theme button component
const ThemeButton = (0, react_1.memo)(({ theme, currentTheme, onClick }) => (<button_1.Button variant={currentTheme === theme ? 'default' : 'outline'} onClick={onClick} aria-pressed={currentTheme === theme}>
    {theme.charAt(0).toUpperCase() + theme.slice(1)}
  </button_1.Button>));
ThemeButton.displayName = 'ThemeButton';
const PortalXSettings = () => {
    const [config, setConfig] = (0, react_1.useState)(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedConfig = localStorage.getItem('portalx_config');
                return savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;
            }
            catch (error) {
                console.error('Failed to load settings:', error);
                return DEFAULT_CONFIG;
            }
        }
        return DEFAULT_CONFIG;
    });
    const [otp, setOtp] = (0, react_1.useState)('');
    const [client, setClient] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)(null);
    // Save config to localStorage
    (0, react_1.useEffect)(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('portalx_config', JSON.stringify(config));
            }
            catch (error) {
                console.error('Failed to save settings:', error);
                setError('Failed to save settings');
            }
        }
    }, [config]);
    // Apply theme
    (0, react_1.useEffect)(() => {
        document.documentElement.setAttribute('data-theme', config.theme);
    }, [config.theme]);
    const handleConnect = (0, react_1.useCallback)(async () => {
        try {
            const verified = speakeasy_1.default.totp.verify({
                secret: config.otpSecret,
                encoding: 'base32',
                token: otp,
                window: 1
            });
            if (!verified) {
                setError('Invalid OTP');
                return;
            }
            const newClient = new PortalXBlockchainClient_1.PortalXBlockchainClient(config.rpcUrls);
            await newClient.getActiveConnection();
            setClient(newClient);
            setIsConnected(true);
            setStatus('Connected to Solana blockchain');
            setError(null);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
            setError(errorMessage);
            setStatus('Connection failed');
        }
    }, [config.otpSecret, config.rpcUrls, otp]);
    const handleRpcUrlChange = (0, react_1.useCallback)((index, value) => {
        if (!PortalXValidation_1.PortalXValidation.isValidRpcUrl(value)) {
            setError('Invalid RPC URL');
            return;
        }
        setConfig(prev => {
            const newRpcUrls = [...prev.rpcUrls];
            newRpcUrls[index] = value;
            return { ...prev, rpcUrls: newRpcUrls };
        });
        setError(null);
    }, []);
    const handleJitoUrlChange = (0, react_1.useCallback)((value) => {
        if (!PortalXValidation_1.PortalXValidation.isValidUrl(value)) {
            setError('Invalid Jito URL');
            return;
        }
        setConfig(prev => ({ ...prev, jitoUrl: value }));
        setError(null);
    }, []);
    const handleMaxWalletsChange = (0, react_1.useCallback)((value) => {
        const numValue = parseInt(value);
        if (!PortalXValidation_1.PortalXValidation.isValidWalletCount(numValue)) {
            setError('Invalid wallet count');
            return;
        }
        setConfig(prev => ({ ...prev, maxWallets: numValue }));
        setError(null);
    }, []);
    const handleDefaultTipChange = (0, react_1.useCallback)((value) => {
        const numValue = parseFloat(value);
        if (!PortalXValidation_1.PortalXValidation.isValidSwapAmount(numValue)) {
            setError('Invalid tip amount');
            return;
        }
        setConfig(prev => ({ ...prev, defaultTip: numValue }));
        setError(null);
    }, []);
    const handleThemeChange = (0, react_1.useCallback)((theme) => {
        setConfig(prev => ({ ...prev, theme }));
    }, []);
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <span>Settings</span>
            <div className="flex gap-2">
              <ThemeButton theme="light" currentTheme={config.theme} onClick={() => handleThemeChange('light')}/>
              <ThemeButton theme="dark" currentTheme={config.theme} onClick={() => handleThemeChange('dark')}/>
              <ThemeButton theme="blue" currentTheme={config.theme} onClick={() => handleThemeChange('blue')}/>
            </div>
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">RPC Endpoints</h3>
              <div className="space-y-4">
                {config.rpcUrls.map((url, index) => (<RpcUrlInput key={index} url={url} index={index} onChange={handleRpcUrlChange}/>))}
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="jito-url">Jito URL</label_1.Label>
              <input_1.Input id="jito-url" value={config.jitoUrl} onChange={(e) => handleJitoUrlChange(e.target.value)} placeholder="Enter Jito URL"/>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security</h3>
              <div className="space-y-2">
                <label_1.Label htmlFor="otp">2FA OTP</label_1.Label>
                <input_1.Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 2FA OTP"/>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Secret for 2FA (save this):</p>
                <code className="block p-2 bg-muted rounded mt-1">{config.otpSecret}</code>
              </div>
              <button_1.Button onClick={handleConnect} className="w-full">
                <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
                {isConnected ? 'Reconnect' : 'Connect to Blockchain'}
              </button_1.Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Limits</h3>
              <div className="space-y-2">
                <label_1.Label htmlFor="max-wallets">Max Wallets</label_1.Label>
                <input_1.Input id="max-wallets" type="number" value={config.maxWallets} onChange={(e) => handleMaxWalletsChange(e.target.value)} placeholder="Enter max wallets"/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="default-tip">Default Jito Tip (SOL)</label_1.Label>
                <input_1.Input id="default-tip" type="number" value={config.defaultTip} onChange={(e) => handleDefaultTipChange(e.target.value)} placeholder="Enter default tip" step="0.001"/>
              </div>
            </div>
          </div>

          {status && (<div className="text-sm text-green-600">
              {status}
            </div>)}

          {error && (<div className="text-sm text-red-600">
              {error}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
exports.default = (0, react_1.memo)(PortalXSettings);
