import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { PortalXBlockchainClient } from '@/utils/PortalXBlockchainClient';

interface TokenMetadata {
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  decimals: number;
  totalSupply: number;
}

const PortalXTokenEditor: React.FC = () => {
  const [metadata, setMetadata] = useState<TokenMetadata>({
    name: '',
    symbol: '',
    imageUrl: '',
    description: '',
    decimals: 9,
    totalSupply: 1000000
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof TokenMetadata, value: string | number) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (url: string) => {
    setMetadata(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const client = new PortalXBlockchainClient();
      await client.updateTokenMetadata(metadata);
      // Handle success
    } catch (error) {
      // Handle error
      console.error('Failed to save token metadata:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Metadata Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tokenName">Token Name</Label>
          <Input
            id="tokenName"
            value={metadata.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., My Token"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tokenSymbol">Token Symbol</Label>
          <Input
            id="tokenSymbol"
            value={metadata.symbol}
            onChange={(e) => handleChange('symbol', e.target.value)}
            placeholder="e.g., MTK"
          />
        </div>

        <div className="space-y-2">
          <Label>Token Image</Label>
          <ImageUpload
            value={metadata.imageUrl}
            onChange={handleImageUpload}
            placeholder="Upload token image"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tokenDescription">Description</Label>
          <Textarea
            id="tokenDescription"
            value={metadata.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your token..."
            rows={4}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tokenDecimals">Decimals</Label>
            <Input
              id="tokenDecimals"
              type="number"
              value={metadata.decimals}
              onChange={(e) => handleChange('decimals', parseInt(e.target.value))}
              min={0}
              max={9}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenSupply">Total Supply</Label>
            <Input
              id="tokenSupply"
              type="number"
              value={metadata.totalSupply}
              onChange={(e) => handleChange('totalSupply', parseInt(e.target.value))}
              min={1}
            />
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Token Metadata'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PortalXTokenEditor; 