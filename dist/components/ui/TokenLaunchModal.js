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
const button_1 = require("./button");
const dialog_1 = require("./dialog");
const tabs_1 = require("./tabs");
const lucide_react_1 = require("lucide-react");
const input_1 = require("./input");
const label_1 = require("./label");
const slider_1 = require("./slider");
const TokenLaunchModal = () => {
    const [tokenName, setTokenName] = (0, react_1.useState)("");
    const [tokenSymbol, setTokenSymbol] = (0, react_1.useState)("");
    const [initialSupply, setInitialSupply] = (0, react_1.useState)("1000000");
    const [startPrice, setStartPrice] = (0, react_1.useState)("0.0001");
    const [maxPrice, setMaxPrice] = (0, react_1.useState)("0.001");
    const [curveFactor, setCurveFactor] = (0, react_1.useState)([50]);
    const [twitterLink, setTwitterLink] = (0, react_1.useState)("");
    const [telegramLink, setTelegramLink] = (0, react_1.useState)("");
    const [websiteLink, setWebsiteLink] = (0, react_1.useState)("");
    const handleLaunch = () => {
        // TODO: Implement token launch logic
        console.log("Launching token:", {
            tokenName,
            tokenSymbol,
            initialSupply,
            startPrice,
            maxPrice,
            curveFactor,
            twitterLink,
            telegramLink,
            websiteLink
        });
    };
    return (<dialog_1.Dialog>
      <dialog_1.DialogTrigger asChild>
        <button_1.Button variant="outline" className="w-full">
          <lucide_react_1.PlusCircle className="mr-2 h-4 w-4"/>
          Launch Token
        </button_1.Button>
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="sm:max-w-[600px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Launch New Token</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        <tabs_1.Tabs defaultValue="basic">
          <tabs_1.TabsList className="grid w-full grid-cols-3">
            <tabs_1.TabsTrigger value="basic">Basic Info</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="parameters">Parameters</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="social">Social</tabs_1.TabsTrigger>
          </tabs_1.TabsList>
          
          <tabs_1.TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="tokenName">Token Name</label_1.Label>
              <input_1.Input id="tokenName" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="Enter token name"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="tokenSymbol">Token Symbol</label_1.Label>
              <input_1.Input id="tokenSymbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} placeholder="Enter token symbol"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="initialSupply">Initial Supply</label_1.Label>
              <input_1.Input id="initialSupply" type="number" value={initialSupply} onChange={(e) => setInitialSupply(e.target.value)} placeholder="Enter initial supply"/>
            </div>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="parameters" className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="startPrice">Start Price (SOL)</label_1.Label>
              <input_1.Input id="startPrice" type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} placeholder="Enter start price" step="0.000001"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="maxPrice">Max Price (SOL)</label_1.Label>
              <input_1.Input id="maxPrice" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Enter max price" step="0.000001"/>
            </div>
            <div className="space-y-2">
              <label_1.Label>Curve Factor</label_1.Label>
              <slider_1.Slider value={curveFactor} onValueChange={setCurveFactor} max={100} step={1}/>
            </div>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="social" className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="twitterLink">Twitter Link</label_1.Label>
              <input_1.Input id="twitterLink" value={twitterLink} onChange={(e) => setTwitterLink(e.target.value)} placeholder="Enter Twitter link"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="telegramLink">Telegram Link</label_1.Label>
              <input_1.Input id="telegramLink" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} placeholder="Enter Telegram link"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="websiteLink">Website Link</label_1.Label>
              <input_1.Input id="websiteLink" value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="Enter website link"/>
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
        
        <div className="flex justify-end mt-4">
          <button_1.Button onClick={handleLaunch}>Launch Token</button_1.Button>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
};
exports.default = TokenLaunchModal;
