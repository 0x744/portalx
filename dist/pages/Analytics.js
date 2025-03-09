"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const card_1 = require("../components/ui/card");
const tabs_1 = require("../components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const PriceChart_1 = __importDefault(require("../components/PriceChart"));
const priceService_1 = __importDefault(require("../services/priceService"));
const Analytics = () => {
    const { priceData } = (0, priceService_1.default)();
    const currentPrice = priceData[priceData.length - 1]?.price || 0;
    const priceChange = priceData[priceData.length - 1]?.priceChange24h || 0;
    return (<div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      
      <tabs_1.Tabs defaultValue="overview">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Reports</tabs_1.TabsTrigger>
        </tabs_1.TabsList>
        
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">SOL Price</card_1.CardTitle>
                <lucide_react_1.LineChart className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
                <p className={`text-xs ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
                </p>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Total Launches</card_1.CardTitle>
                <lucide_react_1.BarChart2 className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </card_1.CardContent>
            </card_1.Card>
            
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Total Volume</card_1.CardTitle>
                <lucide_react_1.PieChart className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">1,234 SOL</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          <PriceChart_1.default />
        </tabs_1.TabsContent>
        
        <tabs_1.TabsContent value="performance">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance Metrics</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* TODO: Add performance charts */}
              <p className="text-muted-foreground">
                Performance charts will be implemented here.
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
        
        <tabs_1.TabsContent value="reports">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Reports</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* TODO: Add reports list */}
              <p className="text-muted-foreground">
                Reports will be listed here.
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
};
exports.default = Analytics;
