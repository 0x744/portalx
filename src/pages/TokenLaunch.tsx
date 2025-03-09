import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { PortalXValidation } from '../utils/PortalXValidation';
import { PortalXBlockchainClient } from '../utils/PortalXBlockchainClient';

const TokenLaunch: React.FC = () => {
  const [tokenName, setTokenName] = React.useState('');
  const [tokenSymbol, setTokenSymbol] = React.useState('');
  const [decimals, setDecimals] = React.useState(9);
  const [totalSupply, setTotalSupply] = React.useState(1000000);
  const [imageUrl, setImageUrl] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const client = new PortalXBlockchainClient();

  const handleLaunch = async () => {
    try {
      // Validate inputs
      if (!PortalXValidation.isValidTokenName(tokenName)) {
        setError('Invalid token name');
        return;
      }

      if (!PortalXValidation.isValidTokenSymbol(tokenSymbol)) {
        setError('Invalid token symbol');
        return;
      }

      if (!PortalXValidation.isValidDecimals(decimals)) {
        setError('Invalid decimals');
        return;
      }

      if (!PortalXValidation.isValidSupply(totalSupply)) {
        setError('Invalid total supply');
        return;
      }

      if (!PortalXValidation.isValidImageUrl(imageUrl)) {
        setError('Invalid image URL');
        return;
      }

      if (!PortalXValidation.isValidDescription(description)) {
        setError('Invalid description');
        return;
      }

      // Launch token
      await client.updateTokenMetadata({
        name: tokenName,
        symbol: tokenSymbol,
        imageUrl,
        description,
        decimals,
        totalSupply
      });

      setStatus('Token launched successfully');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to launch token';
      setError(errorMessage);
      setStatus('Failed to launch token');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Launch New Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Token Name</Label>
            <Input
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="Enter token name"
            />
          </div>

          <div className="space-y-2">
            <Label>Token Symbol</Label>
            <Input
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
              placeholder="Enter token symbol"
            />
          </div>

          <div className="space-y-2">
            <Label>Decimals</Label>
            <Input
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
              min={0}
              max={9}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Total Supply</Label>
            <Input
              type="number"
              value={totalSupply}
              onChange={(e) => setTotalSupply(Number(e.target.value))}
              min={1}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter token description"
            />
          </div>

          <Button onClick={handleLaunch}>
            Launch Token
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

export default TokenLaunch; 