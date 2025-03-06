import React, { useState, useEffect, useCallback, memo } from 'react';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PortalXBlockchainClient } from '../utils/PortalXBlockchainClient';
import { PortalXValidation } from '../utils/PortalXValidation';
import speakeasy from 'speakeasy';

interface SettingsConfig {
  rpcUrls: string[];
  jitoUrl: string;
  otpSecret: string;
  theme: 'light' | 'dark' | 'blue';
  maxWallets: number;
  defaultTip: number;
}

const DEFAULT_CONFIG: SettingsConfig = {
  rpcUrls: [
    'https://api.devnet.solana.com',
    'https://api.testnet.solana.com',
    'https://api.mainnet-beta.solana.com'
  ],
  jitoUrl: 'https://mainnet.jito.wtf',
  otpSecret: speakeasy.generateSecret({ length: 20 }).base32,
  theme: 'dark',
  maxWallets: 1000,
  defaultTip: 0.005
};

// Memoized RPC URL input component
const RpcUrlInput = memo(({ 
  url, 
  index, 
  onChange 
}: { 
  url: string; 
  index: number; 
  onChange: (index: number, value: string) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={`rpc-url-${index}`}>RPC URL {index + 1}</Label>
    <Input
      id={`rpc-url-${index}`}
      value={url}
      onChange={(e) => onChange(index, e.target.value)}
      placeholder="Enter RPC URL"
      aria-label={`RPC URL ${index + 1}`}
    />
  </div>
));

RpcUrlInput.displayName = 'RpcUrlInput';

// Memoized theme button component
const ThemeButton = memo(({ 
  theme, 
  currentTheme, 
  onClick 
}: { 
  theme: 'light' | 'dark' | 'blue'; 
  currentTheme: string; 
  onClick: () => void;
}) => (
  <Button
    variant={currentTheme === theme ? 'default' : 'outline'}
    onClick={onClick}
    aria-pressed={currentTheme === theme}
  >
    {theme.charAt(0).toUpperCase() + theme.slice(1)}
  </Button>
));

ThemeButton.displayName = 'ThemeButton';

const PortalXSettings: React.FC = () => {
  const [config, setConfig] = useState<SettingsConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedConfig = localStorage.getItem('portalx_config');
        return savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;
      } catch (error) {
        console.error('Failed to load settings:', error);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [otp, setOtp] = useState('');
  const [client, setClient] = useState<PortalXBlockchainClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Save config to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('portalx_config', JSON.stringify(config));
      } catch (error) {
        console.error('Failed to save settings:', error);
        setError('Failed to save settings');
      }
    }
  }, [config]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.theme);
  }, [config.theme]);

  const handleConnect = useCallback(async () => {
    try {
      const verified = speakeasy.totp.verify({
        secret: config.otpSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      });

      if (!verified) {
        setError('Invalid OTP');
        return;
      }

      const newClient = new PortalXBlockchainClient(config.rpcUrls);
      await newClient.getActiveConnection();
      setClient(newClient);
      setIsConnected(true);
      setStatus('Connected to Solana blockchain');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      setError(errorMessage);
      setStatus('Connection failed');
    }
  }, [config.otpSecret, config.rpcUrls, otp]);

  const handleRpcUrlChange = useCallback((index: number, value: string) => {
    if (!PortalXValidation.isValidRpcUrl(value)) {
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

  const handleJitoUrlChange = useCallback((value: string) => {
    if (!PortalXValidation.isValidUrl(value)) {
      setError('Invalid Jito URL');
      return;
    }
    setConfig(prev => ({ ...prev, jitoUrl: value }));
    setError(null);
  }, []);

  const handleMaxWalletsChange = useCallback((value: string) => {
    const numValue = parseInt(value);
    if (!PortalXValidation.isValidWalletCount(numValue)) {
      setError('Invalid wallet count');
      return;
    }
    setConfig(prev => ({ ...prev, maxWallets: numValue }));
    setError(null);
  }, []);

  const handleDefaultTipChange = useCallback((value: string) => {
    const numValue = parseFloat(value);
    if (!PortalXValidation.isValidSwapAmount(numValue)) {
      setError('Invalid tip amount');
      return;
    }
    setConfig(prev => ({ ...prev, defaultTip: numValue }));
    setError(null);
  }, []);

  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'blue') => {
    setConfig(prev => ({ ...prev, theme }));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Settings</span>
            <div className="flex gap-2">
              <ThemeButton theme="light" currentTheme={config.theme} onClick={() => handleThemeChange('light')} />
              <ThemeButton theme="dark" currentTheme={config.theme} onClick={() => handleThemeChange('dark')} />
              <ThemeButton theme="blue" currentTheme={config.theme} onClick={() => handleThemeChange('blue')} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">RPC Endpoints</h3>
              <div className="space-y-4">
                {config.rpcUrls.map((url, index) => (
                  <RpcUrlInput
                    key={index}
                    url={url}
                    index={index}
                    onChange={handleRpcUrlChange}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jito-url">Jito URL</Label>
              <Input
                id="jito-url"
                value={config.jitoUrl}
                onChange={(e) => handleJitoUrlChange(e.target.value)}
                placeholder="Enter Jito URL"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security</h3>
              <div className="space-y-2">
                <Label htmlFor="otp">2FA OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 2FA OTP"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Secret for 2FA (save this):</p>
                <code className="block p-2 bg-muted rounded mt-1">{config.otpSecret}</code>
              </div>
              <Button onClick={handleConnect} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                {isConnected ? 'Reconnect' : 'Connect to Blockchain'}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Limits</h3>
              <div className="space-y-2">
                <Label htmlFor="max-wallets">Max Wallets</Label>
                <Input
                  id="max-wallets"
                  type="number"
                  value={config.maxWallets}
                  onChange={(e) => handleMaxWalletsChange(e.target.value)}
                  placeholder="Enter max wallets"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-tip">Default Jito Tip (SOL)</Label>
                <Input
                  id="default-tip"
                  type="number"
                  value={config.defaultTip}
                  onChange={(e) => handleDefaultTipChange(e.target.value)}
                  placeholder="Enter default tip"
                  step="0.001"
                />
              </div>
            </div>
          </div>

          {status && (
            <div className="text-sm text-green-600">
              {status}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(PortalXSettings); 