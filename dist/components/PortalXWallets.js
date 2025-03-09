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
const button_1 = require("./ui/button");
const input_1 = require("./ui/input");
const label_1 = require("./ui/label");
const card_1 = require("./ui/card");
const PortalXWalletManager_1 = require("../utils/PortalXWalletManager");
const PortalXBlockchainClient_1 = require("../utils/PortalXBlockchainClient");
const PortalXValidation_1 = require("../utils/PortalXValidation");
// Memoized wallet card component
const WalletCard = (0, react_1.memo)(({ wallet, onRemove, onUpdateLabel, isEditing, newLabel, onLabelChange, onSaveLabel, onCancelEdit }) => (<card_1.Card className="mb-4">
    <card_1.CardContent className="pt-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-mono text-sm break-all">{wallet.publicKey}</p>
          <p className="text-sm text-gray-500">{wallet.label || 'No label'}</p>
          <p className="text-sm text-gray-500">Balance: {wallet.balance || 0} SOL</p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" size="sm" onClick={() => onUpdateLabel(wallet.publicKey)}>
            Edit Label
          </button_1.Button>
          <button_1.Button variant="destructive" size="sm" onClick={() => onRemove(wallet.publicKey)}>
            Remove
          </button_1.Button>
        </div>
      </div>
    </card_1.CardContent>
  </card_1.Card>));
WalletCard.displayName = 'WalletCard';
const PortalXWallets = () => {
    // Memoize the wallet manager and client instances
    const walletManager = (0, react_1.useMemo)(() => new PortalXWalletManager_1.PortalXWalletManager(), []);
    const client = (0, react_1.useMemo)(() => new PortalXBlockchainClient_1.PortalXBlockchainClient(), []);
    const [walletCount, setWalletCount] = (0, react_1.useState)(1);
    const [wallets, setWallets] = (0, react_1.useState)([]);
    const [fundingAmount, setFundingAmount] = (0, react_1.useState)(0.1);
    const [funderKey, setFunderKey] = (0, react_1.useState)('');
    const [importData, setImportData] = (0, react_1.useState)('');
    const [isGenerating, setIsGenerating] = (0, react_1.useState)(false);
    const [isFunding, setIsFunding] = (0, react_1.useState)(false);
    const [selectedWallet, setSelectedWallet] = (0, react_1.useState)(null);
    const [newLabel, setNewLabel] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)(null);
    // Load wallets on mount with error handling
    (0, react_1.useEffect)(() => {
        const loadWallets = async () => {
            try {
                const loadedWallets = await walletManager.getWallets();
                setWallets(loadedWallets.map(wallet => ({
                    ...wallet,
                    createdAt: new Date().toISOString()
                })));
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to load wallets';
                setError(errorMessage);
            }
        };
        loadWallets();
    }, [walletManager]);
    // Memoize handlers to prevent unnecessary re-renders
    const handleGenerateWallets = (0, react_1.useCallback)(async () => {
        if (!PortalXValidation_1.PortalXValidation.isValidWalletCount(walletCount)) {
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
                const newWallets = await Promise.all(e.data.map(async (wallet) => await walletManager.addWallet(wallet.privateKey)));
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate wallets';
            setError(errorMessage);
        }
        finally {
            setIsGenerating(false);
        }
    }, [walletCount, walletManager]);
    const handleBatchFund = (0, react_1.useCallback)(async () => {
        if (!PortalXValidation_1.PortalXValidation.isValidPrivateKey(funderKey) || !PortalXValidation_1.PortalXValidation.isValidSwapAmount(fundingAmount)) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fund wallets';
            setError(errorMessage);
        }
        finally {
            setIsFunding(false);
        }
    }, [funderKey, fundingAmount, walletManager, client]);
    const handleExport = (0, react_1.useCallback)(async () => {
        try {
            const exportData = await walletManager.exportWallets();
            await navigator.clipboard.writeText(exportData);
            setStatus('Wallets exported to clipboard');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export wallets';
            setError(errorMessage);
        }
    }, [walletManager]);
    const handleImport = (0, react_1.useCallback)(async () => {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import wallets';
            setError(errorMessage);
        }
    }, [importData, walletManager]);
    const handleRemoveWallet = (0, react_1.useCallback)(async (publicKey) => {
        try {
            await walletManager.removeWallet(publicKey);
            const updatedWallets = await walletManager.getWallets();
            setWallets(updatedWallets.map(wallet => ({
                ...wallet,
                createdAt: new Date().toISOString()
            })));
            setStatus('Wallet removed successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove wallet';
            setError(errorMessage);
        }
    }, [walletManager]);
    const handleUpdateLabel = (0, react_1.useCallback)((publicKey) => {
        setSelectedWallet(publicKey);
        const wallet = wallets.find(w => w.publicKey === publicKey);
        setNewLabel(wallet?.label || '');
    }, [wallets]);
    const handleSaveLabel = (0, react_1.useCallback)(async () => {
        if (!selectedWallet || !newLabel)
            return;
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update wallet label';
            setError(errorMessage);
        }
    }, [selectedWallet, newLabel, walletManager]);
    const handleCancelEdit = (0, react_1.useCallback)(() => {
        setSelectedWallet(null);
        setNewLabel('');
    }, []);
    // Memoize the wallet list to prevent unnecessary re-renders
    const walletList = (0, react_1.useMemo)(() => (<div className="space-y-4">
      {wallets.map((wallet) => (<WalletCard key={wallet.publicKey} wallet={wallet} onRemove={handleRemoveWallet} onUpdateLabel={handleUpdateLabel} isEditing={selectedWallet === wallet.publicKey} newLabel={newLabel} onLabelChange={setNewLabel} onSaveLabel={handleSaveLabel} onCancelEdit={handleCancelEdit}/>))}
    </div>), [wallets, selectedWallet, newLabel, handleRemoveWallet, handleUpdateLabel, handleSaveLabel, handleCancelEdit]);
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Wallet Management</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label_1.Label htmlFor="walletCount">Number of Wallets</label_1.Label>
                <input_1.Input id="walletCount" type="number" min="1" max="1000" value={walletCount} onChange={(e) => setWalletCount(Number(e.target.value))}/>
              </div>
              <div className="flex-1">
                <label_1.Label htmlFor="fundingAmount">Funding Amount (SOL)</label_1.Label>
                <input_1.Input id="fundingAmount" type="number" step="0.1" value={fundingAmount} onChange={(e) => setFundingAmount(Number(e.target.value))}/>
              </div>
            </div>
            <div>
              <label_1.Label htmlFor="funderKey">Funder Private Key</label_1.Label>
              <input_1.Input id="funderKey" type="password" value={funderKey} onChange={(e) => setFunderKey(e.target.value)}/>
            </div>
            <div className="flex gap-2">
              <button_1.Button onClick={handleGenerateWallets} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Wallets'}
              </button_1.Button>
              <button_1.Button onClick={handleBatchFund} disabled={isFunding}>
                {isFunding ? 'Funding...' : 'Batch Fund'}
              </button_1.Button>
              <button_1.Button onClick={handleExport}>Export Wallets</button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Import Wallets</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div>
              <label_1.Label htmlFor="importData">Wallet Data</label_1.Label>
              <input_1.Input id="importData" value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Paste wallet data here..."/>
            </div>
            <button_1.Button onClick={handleImport}>Import Wallets</button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {selectedWallet && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Edit Wallet Label</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <div>
                <label_1.Label htmlFor="newLabel">New Label</label_1.Label>
                <input_1.Input id="newLabel" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}/>
              </div>
              <div className="flex gap-2">
                <button_1.Button onClick={handleSaveLabel}>Save Label</button_1.Button>
                <button_1.Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Wallet List</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {walletList}
        </card_1.CardContent>
      </card_1.Card>

      {error && (<div className="text-red-500 text-sm">{error}</div>)}
      {status && (<div className="text-green-500 text-sm">{status}</div>)}
    </div>);
};
exports.default = (0, react_1.memo)(PortalXWallets);
