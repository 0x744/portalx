"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const card_1 = require("../components/ui/card");
const label_1 = require("../components/ui/label");
const input_1 = require("../components/ui/input");
const button_1 = require("../components/ui/button");
const PortalXValidation_1 = require("../utils/PortalXValidation");
const PortalXBlockchainClient_1 = require("../utils/PortalXBlockchainClient");
const TokenLaunch = () => {
    const [tokenName, setTokenName] = react_1.default.useState('');
    const [tokenSymbol, setTokenSymbol] = react_1.default.useState('');
    const [decimals, setDecimals] = react_1.default.useState(9);
    const [totalSupply, setTotalSupply] = react_1.default.useState(1000000);
    const [imageUrl, setImageUrl] = react_1.default.useState('');
    const [description, setDescription] = react_1.default.useState('');
    const [status, setStatus] = react_1.default.useState('');
    const [error, setError] = react_1.default.useState(null);
    const client = new PortalXBlockchainClient_1.PortalXBlockchainClient();
    const handleLaunch = async () => {
        try {
            // Validate inputs
            if (!PortalXValidation_1.PortalXValidation.isValidTokenName(tokenName)) {
                setError('Invalid token name');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidTokenSymbol(tokenSymbol)) {
                setError('Invalid token symbol');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidDecimals(decimals)) {
                setError('Invalid decimals');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidSupply(totalSupply)) {
                setError('Invalid total supply');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidImageUrl(imageUrl)) {
                setError('Invalid image URL');
                return;
            }
            if (!PortalXValidation_1.PortalXValidation.isValidDescription(description)) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to launch token';
            setError(errorMessage);
            setStatus('Failed to launch token');
        }
    };
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Launch New Token</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="space-y-2">
            <label_1.Label>Token Name</label_1.Label>
            <input_1.Input value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="Enter token name"/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Token Symbol</label_1.Label>
            <input_1.Input value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())} placeholder="Enter token symbol"/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Decimals</label_1.Label>
            <input_1.Input type="number" value={decimals} onChange={(e) => setDecimals(Number(e.target.value))} min={0} max={9} step={1}/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Total Supply</label_1.Label>
            <input_1.Input type="number" value={totalSupply} onChange={(e) => setTotalSupply(Number(e.target.value))} min={1} step={1}/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Image URL</label_1.Label>
            <input_1.Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Enter image URL"/>
          </div>

          <div className="space-y-2">
            <label_1.Label>Description</label_1.Label>
            <input_1.Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter token description"/>
          </div>

          <button_1.Button onClick={handleLaunch}>
            Launch Token
          </button_1.Button>

          {status && (<div className="text-sm text-muted-foreground">
              {status}
            </div>)}

          {error && (<div className="text-sm text-red-500">
              {error}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
exports.default = TokenLaunch;
