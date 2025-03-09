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
const lucide_react_1 = require("lucide-react");
const TopBar = () => {
    const [solPrice, setSolPrice] = (0, react_1.useState)("0.00");
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const fetchSolanaPrice = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
            const data = await response.json();
            setSolPrice(data.solana.usd.toFixed(2));
        }
        catch (error) {
            console.error("Error fetching Solana price:", error);
        }
        setIsLoading(false);
    };
    (0, react_1.useEffect)(() => {
        const intervalId = setInterval(fetchSolanaPrice, 30000);
        fetchSolanaPrice();
        return () => clearInterval(intervalId);
    }, []);
    return (<div className="h-8 bg-black border-b border-border flex items-center justify-between px-4 select-none">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <span className="text-primary font-semibold">PortalX</span>
          <span className="text-muted-foreground ml-2 text-sm">1.0.0</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">1 SOL = ${solPrice} USD</span>
          <button_1.Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchSolanaPrice} disabled={isLoading}>
            <lucide_react_1.RotateCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}/>
          </button_1.Button>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="ghost" size="icon" className="h-6 w-6">
            <lucide_react_1.Minus className="h-3 w-3"/>
          </button_1.Button>
          <button_1.Button variant="ghost" size="icon" className="h-6 w-6">
            <lucide_react_1.Square className="h-3 w-3"/>
          </button_1.Button>
          <button_1.Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-500/20 hover:text-red-400">
            <lucide_react_1.X className="h-3 w-3"/>
          </button_1.Button>
        </div>
      </div>
    </div>);
};
exports.default = TopBar;
