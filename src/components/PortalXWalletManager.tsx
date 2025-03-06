import React, { useState, useEffect } from 'react';
import { Wallet, Key, Download, Upload, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { PortalXWalletManager as WalletManager } from '../utils/PortalXWalletManager';
import { PortalXValidation } from '../utils/PortalXValidation';

const walletManager = new WalletManager();
const validation = new PortalXValidation();

interface WalletData {
  publicKey: string;
  label: string;
  createdAt: number;
}

const PortalXWalletManager: React.FC = () => {
  const [walletCount, setWalletCount] = useState<number>(5);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const loadedWallets = await walletManager.getWallets();
      setWallets(loadedWallets.map(w => ({
        publicKey: w.publicKey,
        label: w.label,
        createdAt: Date.now()
      })));
    } catch (error) {
      setStatus('Failed to load wallets');
    }
  };

  const handleGenerateWallets = async () => {
    if (!validation.validateWalletCount(walletCount)) {
      setStatus('Invalid wallet count');
      return;
    }

    try {
      setIsGenerating(true);
      const newWallets = await walletManager.generateWallets(walletCount);
      setWallets(prev => [...prev, ...newWallets.map(w => ({
        publicKey: w.publicKey,
        label: w.label,
        createdAt: Date.now()
      }))]);
      setStatus(`Generated ${walletCount} wallets`);
    } catch (error) {
      setStatus('Failed to generate wallets');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportWallets = async () => {
    try {
      setIsImporting(true);
      await walletManager.importWallets(importData);
      await loadWallets();
      setStatus('Wallets imported successfully');
    } catch (error) {
      setStatus('Failed to import wallets');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportWallets = async () => {
    try {
      const data = await walletManager.exportWallets();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wallets.json';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Wallets exported successfully');
    } catch (error) {
      setStatus('Failed to export wallets');
    }
  };

  const handleDeleteWallet = async (publicKey: string) => {
    try {
      await walletManager.removeWallet(publicKey);
      setWallets(prev => prev.filter(w => w.publicKey !== publicKey));
      setStatus('Wallet deleted successfully');
    } catch (error) {
      setStatus('Failed to delete wallet');
    }
  };

  const handleUpdateLabel = async (publicKey: string) => {
    if (!validation.validateLabel(newLabel)) {
      setStatus('Invalid label');
      return;
    }

    try {
      await walletManager.updateWalletBalance(publicKey, 0); // Update balance to trigger save
      setWallets(prev => prev.map(w => 
        w.publicKey === publicKey ? { ...w, label: newLabel } : w
      ));
      setEditingWallet(null);
      setNewLabel('');
      setStatus('Label updated successfully');
    } catch (error) {
      setStatus('Failed to update label');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Number of Wallets</Label>
            <div className="flex gap-2">
              <Slider
                value={[walletCount]}
                onValueChange={(values: number[]) => setWalletCount(values[0])}
                min={1}
                max={100}
                step={1}
                className="flex-1"
              />
              <div className="w-12 text-sm">{walletCount}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerateWallets}
              disabled={isGenerating}
              className="flex-1"
            >
              <Key className="mr-2 h-4 w-4" />
              Generate Wallets
            </Button>
            <Button
              onClick={handleExportWallets}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Import Wallets</Label>
            <div className="flex gap-2">
              <Input
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste wallet data"
                className="flex-1"
              />
              <Button
                onClick={handleImportWallets}
                disabled={isImporting || !importData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Wallets</Label>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <div
                  key={wallet.publicKey}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex-1">
                    {editingWallet === wallet.publicKey ? (
                      <div className="flex gap-2">
                        <Input
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="New label"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleUpdateLabel(wallet.publicKey)}
                          size="sm"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingWallet(null);
                            setNewLabel('');
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{wallet.publicKey.slice(0, 8)}...</span>
                        <span className="text-muted-foreground">{wallet.label}</span>
                        <Button
                          onClick={() => {
                            setEditingWallet(wallet.publicKey);
                            setNewLabel(wallet.label);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeleteWallet(wallet.publicKey)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {status && (
            <div className="text-sm text-muted-foreground">
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalXWalletManager; 