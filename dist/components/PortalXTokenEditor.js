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
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const image_upload_1 = require("@/components/ui/image-upload");
const PortalXBlockchainClient_1 = require("@/utils/PortalXBlockchainClient");
const PortalXTokenEditor = () => {
    const [metadata, setMetadata] = (0, react_1.useState)({
        name: '',
        symbol: '',
        imageUrl: '',
        description: '',
        decimals: 9,
        totalSupply: 1000000
    });
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const handleChange = (field, value) => {
        setMetadata(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleImageUpload = (url) => {
        setMetadata(prev => ({
            ...prev,
            imageUrl: url
        }));
    };
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const client = new PortalXBlockchainClient_1.PortalXBlockchainClient();
            await client.updateTokenMetadata(metadata);
            // Handle success
        }
        catch (error) {
            // Handle error
            console.error('Failed to save token metadata:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Token Metadata Editor</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div className="space-y-2">
          <label_1.Label htmlFor="tokenName">Token Name</label_1.Label>
          <input_1.Input id="tokenName" value={metadata.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., My Token"/>
        </div>

        <div className="space-y-2">
          <label_1.Label htmlFor="tokenSymbol">Token Symbol</label_1.Label>
          <input_1.Input id="tokenSymbol" value={metadata.symbol} onChange={(e) => handleChange('symbol', e.target.value)} placeholder="e.g., MTK"/>
        </div>

        <div className="space-y-2">
          <label_1.Label>Token Image</label_1.Label>
          <image_upload_1.ImageUpload value={metadata.imageUrl} onChange={handleImageUpload} placeholder="Upload token image"/>
        </div>

        <div className="space-y-2">
          <label_1.Label htmlFor="tokenDescription">Description</label_1.Label>
          <textarea_1.Textarea id="tokenDescription" value={metadata.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe your token..." rows={4}/>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label_1.Label htmlFor="tokenDecimals">Decimals</label_1.Label>
            <input_1.Input id="tokenDecimals" type="number" value={metadata.decimals} onChange={(e) => handleChange('decimals', parseInt(e.target.value))} min={0} max={9}/>
          </div>

          <div className="space-y-2">
            <label_1.Label htmlFor="tokenSupply">Total Supply</label_1.Label>
            <input_1.Input id="tokenSupply" type="number" value={metadata.totalSupply} onChange={(e) => handleChange('totalSupply', parseInt(e.target.value))} min={1}/>
          </div>
        </div>

        <button_1.Button className="w-full" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Token Metadata'}
        </button_1.Button>
      </card_1.CardContent>
    </card_1.Card>);
};
exports.default = PortalXTokenEditor;
