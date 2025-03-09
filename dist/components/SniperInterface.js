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
exports.SniperInterface = void 0;
const react_1 = __importStar(require("react"));
const card_1 = require("./ui/card");
const tabs_1 = require("./ui/tabs");
const input_1 = require("./ui/input");
const label_1 = require("./ui/label");
const button_1 = require("./ui/button");
const lucide_react_1 = require("lucide-react");
const SniperInterface = () => {
    const [targetAddress, setTargetAddress] = (0, react_1.useState)("");
    const [buyAmount, setBuyAmount] = (0, react_1.useState)("0.1");
    const [maxPrice, setMaxPrice] = (0, react_1.useState)("0.001");
    const [detectMigration, setDetectMigration] = (0, react_1.useState)(true);
    const [_slippage, _setSlippage] = (0, react_1.useState)(1);
    const [targets, setTargets] = (0, react_1.useState)([
        {
            address: "7KqpU9VEZNVw8YBRKZxnfGfuYQwUkUZ9dBGdq4qYX2UZ",
            buyAmount: 0.2,
            maxPrice: 0.0015,
            detectMigration: true,
            status: "Monitoring"
        },
        {
            address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
            buyAmount: 0.5,
            maxPrice: 0.002,
            detectMigration: false,
            status: "Pending"
        }
    ]);
    const addTarget = () => {
        if (targetAddress) {
            setTargets([
                ...targets,
                {
                    address: targetAddress,
                    buyAmount: parseFloat(buyAmount),
                    maxPrice: parseFloat(maxPrice),
                    detectMigration,
                    status: "Monitoring"
                }
            ]);
            setTargetAddress("");
        }
    };
    const removeTarget = (address) => {
        setTargets(targets.filter((target) => target.address !== address));
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center">
          <lucide_react_1.Zap className="mr-2 h-5 w-5 text-primary"/>
          Sniper System
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs defaultValue="configure">
          <tabs_1.TabsList className="grid w-full grid-cols-2 mb-4">
            <tabs_1.TabsTrigger value="configure">Configure</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="targets">Active Targets</tabs_1.TabsTrigger>
          </tabs_1.TabsList>
          
          <tabs_1.TabsContent value="configure" className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="targetAddress">Target Address</label_1.Label>
              <input_1.Input id="targetAddress" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} placeholder="Enter token address"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="buyAmount">Buy Amount (SOL)</label_1.Label>
              <input_1.Input id="buyAmount" type="number" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} placeholder="Enter buy amount" step="0.01"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="maxPrice">Max Price (SOL)</label_1.Label>
              <input_1.Input id="maxPrice" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Enter max price" step="0.000001"/>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="detectMigration" checked={detectMigration} onChange={(e) => setDetectMigration(e.target.checked)}/>
              <label_1.Label htmlFor="detectMigration">Detect Migration</label_1.Label>
            </div>
            <button_1.Button onClick={addTarget} className="w-full">
              Add Target
            </button_1.Button>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="targets">
            <div className="space-y-4">
              {targets.map((target) => (<card_1.Card key={target.address}>
                  <card_1.CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{target.address}</p>
                        <p className="text-sm text-muted-foreground">
                          Buy: {target.buyAmount} SOL | Max: {target.maxPrice} SOL
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${target.status === "Monitoring" ? "text-green-500" : "text-yellow-500"}`}>
                          {target.status}
                        </span>
                        <button_1.Button variant="ghost" size="sm" onClick={() => removeTarget(target.address)}>
                          Remove
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>))}
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-900/30 rounded-md flex items-start">
          <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5"/>
          <div className="text-sm">
            <p className="font-medium text-yellow-500">Important Notice</p>
            <p className="text-muted-foreground">
              The sniper system executes transactions automatically. Please ensure you have sufficient SOL in your wallets and have set appropriate parameters.
            </p>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
};
exports.SniperInterface = SniperInterface;
