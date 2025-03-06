import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { PortalXValidation } from '../utils/PortalXValidation';
import { PortalXBlockchainClient } from '../utils/PortalXBlockchainClient';

const Settings: React.FC = () => {
  const [rpcUrl, setRpcUrl] = React.useState('https://api.mainnet-beta.solana.com');
  const [jitoUrl, setJitoUrl] = React.useState('https://mainnet.jito.wtf');
  const [maxWallets, setMaxWallets] = React.useState(100);
  const [defaultTip, setDefaultTip] = React.useState(0.005);
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    try {
      if (!PortalXValidation.isValidRpcUrl(rpcUrl)) {
        setError('Invalid RPC URL');
        return;
      }

      if (!PortalXValidation.isValidUrl(jitoUrl)) {
        setError('Invalid Jito URL');
        return;
      }

      if (!PortalXValidation.isValidWalletCount(maxWallets)) {
        setError('Invalid wallet count');
        return;
      }

      if (!PortalXValidation.isValidSwapAmount(defaultTip)) {
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
      const client = new PortalXBlockchainClient([rpcUrl]);
      await client.getActiveConnection();
      
      setStatus('Settings saved successfully');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      setError(errorMessage);
      setStatus('Failed to save settings');
    }
  };

  React.useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('portalx_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setRpcUrl(settings.rpcUrl);
        setJitoUrl(settings.jitoUrl);
        setMaxWallets(settings.maxWallets);
        setDefaultTip(settings.defaultTip);
      } catch (error) {
        setError('Failed to load settings');
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>RPC URL</Label>
            <Input
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              placeholder="Enter RPC URL"
            />
          </div>

          <div className="space-y-2">
            <Label>Jito URL</Label>
            <Input
              value={jitoUrl}
              onChange={(e) => setJitoUrl(e.target.value)}
              placeholder="Enter Jito URL"
            />
          </div>

          <div className="space-y-2">
            <Label>Max Wallets</Label>
            <Input
              type="number"
              value={maxWallets}
              onChange={(e) => setMaxWallets(Number(e.target.value))}
              min={1}
              max={1000}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Tip (SOL)</Label>
            <Input
              type="number"
              value={defaultTip}
              onChange={(e) => setDefaultTip(Number(e.target.value))}
              min={0}
              max={1}
              step={0.001}
            />
          </div>

          <Button onClick={handleSave}>
            Save Settings
          </Button>

          {status && (
            <div className="text-sm text-muted-foreground">
              {status}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings; 