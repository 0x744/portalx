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
const PortalXWalletManager_1 = require("../utils/PortalXWalletManager");
const PortalXValidation_1 = require("../utils/PortalXValidation");
const walletManager = new PortalXWalletManager_1.PortalXWalletManager();
const validation = new PortalXValidation_1.PortalXValidation();
const PortalXWalletManager = () => {
    const [walletCount, setWalletCount] = (0, react_1.useState)(5);
    const [wallets, setWallets] = (0, react_1.useState)([]);
    const [isGenerating, setIsGenerating] = (0, react_1.useState)(false);
    const [isImporting, setIsImporting] = (0, react_1.useState)(false);
    const [importData, setImportData] = (0, react_1.useState)('');
    const [importPassword, setImportPassword] = (0, react_1.useState)('');
    const [editingWallet, setEditingWallet] = (0, react_1.useState)(null);
    const [newLabel, setNewLabel] = (0, react_1.useState)('');
    const [status, setStatus] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
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
        }
        catch (error) {
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
        }
        catch (error) {
            setStatus('Failed to generate wallets');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleImportWallets = async () => {
        try {
            setIsImporting(true);
            await walletManager.importWallets(importData);
            await loadWallets();
            setStatus('Wallets imported successfully');
        }
        catch (error) {
            setStatus('Failed to import wallets');
        }
        finally {
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
        }
        catch (error) {
            setStatus('Failed to export wallets');
        }
    };
    const handleDeleteWallet = async (publicKey) => {
        try {
            await walletManager.removeWallet(publicKey);
            setWallets(prev => prev.filter(w => w.publicKey !== publicKey));
            setStatus('Wallet deleted successfully');
        }
        catch (error) {
            setStatus('Failed to delete wallet');
        }
    };
    const handleUpdateLabel = async (publicKey) => {
        if (!validation.validateLabel(newLabel)) {
            setStatus('Invalid label');
            return;
        }
        try {
            await walletManager.updateWalletBalance(publicKey, 0); // Update balance to trigger save
            setWallets(prev => prev.map(w => w.publicKey === publicKey ? { ...w, label: newLabel } : w));
            setEditingWallet(null);
            setNewLabel('');
            setStatus('Label updated successfully');
        }
        catch (error) {
            setStatus('Failed to update label');
        }
    };
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Wallet className="h-5 w-5"/>
            Wallet Manager
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="space-y-2">
            <label_1.Label>Number of Wallets</label_1.Label>
            <div className="flex gap-2">
              <slider_1.Slider value={[walletCount]} onValueChange={(values) => setWalletCount(values[0])} min={1} max={100} step={1} className="flex-1"/>
              <div className="w-12 text-sm">{walletCount}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button_1.Button onClick={handleGenerateWallets} disabled={isGenerating} className="flex-1">
              <lucide_react_1.Key className="mr-2 h-4 w-4"/>
              Generate Wallets
            </button_1.Button>
            <button_1.Button onClick={handleExportWallets} variant="outline" className="flex-1">
              <lucide_react_1.Download className="mr-2 h-4 w-4"/>
              Export
            </button_1.Button>
          </div>

          <div className="space-y-2">
            <label_1.Label>Import Wallets</label_1.Label>
            <div className="flex gap-2">
              <input_1.Input value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Paste wallet data" className="flex-1"/>
              <button_1.Button onClick={handleImportWallets} disabled={isImporting || !importData}>
                <lucide_react_1.Upload className="mr-2 h-4 w-4"/>
                Import
              </button_1.Button>
            </div>
          </div>

          <div className="space-y-2">
            <label_1.Label>Wallets</label_1.Label>
            <div className="space-y-2">
              {wallets.map((wallet) => (<div key={wallet.publicKey} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex-1">
                    {editingWallet === wallet.publicKey ? (<div className="flex gap-2">
                        <input_1.Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New label" className="flex-1"/>
                        <button_1.Button onClick={() => handleUpdateLabel(wallet.publicKey)} size="sm">
                          <lucide_react_1.Check className="h-4 w-4"/>
                        </button_1.Button>
                        <button_1.Button onClick={() => {
                    setEditingWallet(null);
                    setNewLabel('');
                }} variant="destructive" size="sm">
                          <lucide_react_1.X className="h-4 w-4"/>
                        </button_1.Button>
                      </div>) : (<div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{wallet.publicKey.slice(0, 8)}...</span>
                        <span className="text-muted-foreground">{wallet.label}</span>
                        <button_1.Button onClick={() => {
                    setEditingWallet(wallet.publicKey);
                    setNewLabel(wallet.label);
                }} variant="ghost" size="sm">
                          <lucide_react_1.Edit2 className="h-4 w-4"/>
                        </button_1.Button>
                      </div>)}
                  </div>
                  <button_1.Button onClick={() => handleDeleteWallet(wallet.publicKey)} variant="ghost" size="sm">
                    <lucide_react_1.Trash2 className="h-4 w-4"/>
                  </button_1.Button>
                </div>))}
            </div>
          </div>

          {status && (<div className="text-sm text-muted-foreground">
              {status}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
exports.default = PortalXWalletManager;
