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
const tabs_1 = require("@/components/ui/tabs");
const switch_1 = require("@/components/ui/switch");
const BundlerTab = () => {
    const [safeMode, setSafeMode] = (0, react_1.useState)(true);
    const [experimentalMode, setExperimentalMode] = (0, react_1.useState)(false);
    return (<div className="space-y-4">
      <tabs_1.Tabs defaultValue="launch" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="launch">Launch</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="sell">Sell</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="tools">Tools</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="launch" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Token Launch Configuration</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="tokenName">Token Name</label_1.Label>
                  <input_1.Input id="tokenName" placeholder="My Token"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="tokenSymbol">Token Symbol</label_1.Label>
                  <input_1.Input id="tokenSymbol" placeholder="MTK"/>
                </div>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="supply">Total Supply</label_1.Label>
                <input_1.Input id="supply" type="number" placeholder="1000000000"/>
              </div>
              <div className="flex items-center space-x-2">
                <switch_1.Switch id="safeMode" checked={safeMode} onCheckedChange={setSafeMode}/>
                <label_1.Label htmlFor="safeMode">Safe Mode (Same-block purchases)</label_1.Label>
              </div>
              <div className="flex items-center space-x-2">
                <switch_1.Switch id="experimentalMode" checked={experimentalMode} onCheckedChange={setExperimentalMode}/>
                <label_1.Label htmlFor="experimentalMode">Experimental Mode (Hide from graphs)</label_1.Label>
              </div>
              <button_1.Button className="w-full">Launch Token</button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="sell" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Sell Configuration</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="sellMode">Sell Mode</label_1.Label>
                  <select id="sellMode" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="dumpAll">Dump All</option>
                    <option value="dumpAllPercent">Dump All %</option>
                    <option value="singleSell">Single Sell</option>
                    <option value="raydiumDumpAll">Raydium Dump All</option>
                    <option value="raydiumSingleSell">Raydium Single Sell</option>
                    <option value="sendSpl">Send SPL</option>
                    <option value="devSell">Dev Sell</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="sellAmount">Amount (%)</label_1.Label>
                  <input_1.Input id="sellAmount" type="number" placeholder="100"/>
                </div>
              </div>
              <button_1.Button className="w-full">Execute Sell</button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="tools" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Token Tools</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="cloneToken">Clone Token Address</label_1.Label>
                <input_1.Input id="cloneToken" placeholder="Enter token address to clone"/>
                <button_1.Button className="w-full">Clone Token</button_1.Button>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="holderCount">Number of Holders</label_1.Label>
                <input_1.Input id="holderCount" type="number" placeholder="100"/>
                <button_1.Button className="w-full">Generate Holders</button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
};
exports.default = BundlerTab;
