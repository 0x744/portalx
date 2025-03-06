import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Wallet, Plus, Download, Upload, Trash2, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PortalXWalletManager } from '../utils/PortalXWalletManager';
import { PortalXBlockchainClient } from '../utils/PortalXBlockchainClient';
import { PortalXValidation } from '../utils/PortalXValidation';

interface WalletData {
  publicKey: string;
  privateKey: string;
  label?: string;
  balance?: number;
  createdAt: string;
}

// Memoized wallet card component
const WalletCard = memo(({ 
  wallet, 
  onRemove, 
  onUpdateLabel, 
  isEditing, 
  newLabel, 
  onLabelChange, 
  onSaveLabel, 
  onCancelEdit 
}: { 
  wallet: WalletData;
  onRemove: (publicKey: string) => void;
  onUpdateLabel: (publicKey: string) => void;
  isEditing: boolean;
  newLabel: string;
  onLabelChange: (value: string) => void;
  onSaveLabel: () => void;
  onCancelEdit: () => void;
}) => (
  <Card className="mb-4">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-mono text-sm break-all">{wallet.publicKey}</p>
          <p className="text-sm text-gray-500">{wallet.label || 'No label'}</p>
          <p className="text-sm text-gray-500">Balance: {wallet.balance || 0} SOL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onUpdateLabel(wallet.publicKey)}>
            Edit Label
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onRemove(wallet.publicKey)}>
            Remove
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
));

WalletCard.displayName = 'WalletCard';

const PortalXWallets: React.FC = () => {
  // Memoize the wallet manager and client instances
  const walletManager = useMemo(() => new PortalXWalletManager(), []);
  const client = useMemo(() => new PortalXBlockchainClient(), []);

  const [walletCount, setWalletCount] = useState<number>(1);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [fundingAmount, setFundingAmount] = useState<number>(0.1);
  const [funderKey, setFunderKey] = useState('');
  const [importData, setImportData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Load wallets on mount with error handling
  useEffect(() => {
    const loadWallets = async () => {
      try {
        const loadedWallets = await walletManager.getWallets();
        setWallets(loadedWallets.map(wallet => ({
          ...wallet,
          createdAt: new Date().toISOString()
        })));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load wallets';
        setError(errorMessage);
      }
    };
    loadWallets();
  }, [walletManager]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleGenerateWallets = useCallback(async () => {
    if (!PortalXValidation.isValidWalletCount(walletCount)) {
      setError('Invalid wallet count');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const worker = new Worker(new URL('../workers/walletWorker.ts', import.meta.url));
      worker.postMessage({ count: walletCount });
      
      worker.onmessage = async (e) => {
        if (e.data.error) {
          setError(`Error generating wallets: ${e.data.error}`);
          return;
        }
        
        const newWallets = await Promise.all(
          e.data.map(async (wallet: any) => await walletManager.addWallet(wallet.privateKey))
        );
        const updatedWallets = await walletManager.getWallets();
        setWallets(updatedWallets.map(wallet => ({
          ...wallet,
          createdAt: new Date().toISOString()
        })));
        setStatus(`Generated ${newWallets.length} wallets successfully`);
        worker.terminate();
      };

      worker.onerror = (error) => {
        setError(`Worker error: ${error.message}`);
        worker.terminate();
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate wallets';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [walletCount, walletManager]);

  const handleBatchFund = useCallback(async () => {
    if (!PortalXValidation.isValidPrivateKey(funderKey) || !PortalXValidation.isValidSwapAmount(fundingAmount)) {
      setError('Invalid funder key or amount');
      return;
    }

    setIsFunding(true);
    setError(null);
    try {
      const walletList = await walletManager.getWallets();
      for (const wallet of walletList) {
        await client.sendTransaction(funderKey, wallet.publicKey, fundingAmount);
      }
      setStatus(`Funded ${walletList.length} wallets with ${fundingAmount} SOL each`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fund wallets';
      setError(errorMessage);
    } finally {
      setIsFunding(false);
    }
  }, [funderKey, fundingAmount, walletManager, client]);

  const handleExport = useCallback(async () => {
    try {
      const exportData = await walletManager.exportWallets();
      await navigator.clipboard.writeText(exportData);
      setStatus('Wallets exported to clipboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export wallets';
      setError(errorMessage);
    }
  }, [walletManager]);

  const handleImport = useCallback(async () => {
    if (!importData) {
      setError('Please enter wallet data to import');
      return;
    }
    try {
      await walletManager.importWallets(importData);
      const updatedWallets = await walletManager.getWallets();
      setWallets(updatedWallets.map(wallet => ({
        ...wallet,
        createdAt: new Date().toISOString()
      })));
      setStatus('Wallets imported successfully');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import wallets';
      setError(errorMessage);
    }
  }, [importData, walletManager]);

  const handleRemoveWallet = useCallback(async (publicKey: string) => {
    try {
      await walletManager.removeWallet(publicKey);
      const updatedWallets = await walletManager.getWallets();
      setWallets(updatedWallets.map(wallet => ({
        ...wallet,
        createdAt: new Date().toISOString()
      })));
      setStatus('Wallet removed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove wallet';
      setError(errorMessage);
    }
  }, [walletManager]);

  const handleUpdateLabel = useCallback((publicKey: string) => {
    setSelectedWallet(publicKey);
    const wallet = wallets.find(w => w.publicKey === publicKey);
    setNewLabel(wallet?.label || '');
  }, [wallets]);

  const handleSaveLabel = useCallback(async () => {
    if (!selectedWallet || !newLabel) return;

    try {
      await walletManager.updateWalletLabel(selectedWallet, newLabel);
      const updatedWallets = await walletManager.getWallets();
      setWallets(updatedWallets.map(wallet => ({
        ...wallet,
        createdAt: new Date().toISOString()
      })));
      setStatus('Wallet label updated successfully');
      setSelectedWallet(null);
      setNewLabel('');
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update wallet label';
      setError(errorMessage);
    }
  }, [selectedWallet, newLabel, walletManager]);

  const handleCancelEdit = useCallback(() => {
    setSelectedWallet(null);
    setNewLabel('');
  }, []);

  // Memoize the wallet list to prevent unnecessary re-renders
  const walletList = useMemo(() => (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <WalletCard
          key={wallet.publicKey}
          wallet={wallet}
          onRemove={handleRemoveWallet}
          onUpdateLabel={handleUpdateLabel}
          isEditing={selectedWallet === wallet.publicKey}
          newLabel={newLabel}
          onLabelChange={setNewLabel}
          onSaveLabel={handleSaveLabel}
          onCancelEdit={handleCancelEdit}
        />
      ))}
    </div>
  ), [wallets, selectedWallet, newLabel, handleRemoveWallet, handleUpdateLabel, handleSaveLabel, handleCancelEdit]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="walletCount">Number of Wallets</Label>
                <Input
                  id="walletCount"
                  type="number"
                  min="1"
                  max="1000"
                  value={walletCount}
                  onChange={(e) => setWalletCount(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="fundingAmount">Funding Amount (SOL)</Label>
                <Input
                  id="fundingAmount"
                  type="number"
                  step="0.1"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="funderKey">Funder Private Key</Label>
              <Input
                id="funderKey"
                type="password"
                value={funderKey}
                onChange={(e) => setFunderKey(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateWallets}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Wallets'}
              </Button>
              <Button
                onClick={handleBatchFund}
                disabled={isFunding}
              >
                {isFunding ? 'Funding...' : 'Batch Fund'}
              </Button>
              <Button onClick={handleExport}>Export Wallets</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importData">Wallet Data</Label>
              <Input
                id="importData"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste wallet data here..."
              />
            </div>
            <Button onClick={handleImport}>Import Wallets</Button>
          </div>
        </CardContent>
      </Card>

      {selectedWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Wallet Label</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newLabel">New Label</Label>
                <Input
                  id="newLabel"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveLabel}>Save Label</Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Wallet List</CardTitle>
        </CardHeader>
        <CardContent>
          {walletList}
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {status && (
        <div className="text-green-500 text-sm">{status}</div>
      )}
    </div>
  );
};

export default memo(PortalXWallets); 