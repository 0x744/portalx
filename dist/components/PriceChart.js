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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const recharts_1 = require("recharts");
const card_1 = require("./ui/card");
const tabs_1 = require("./ui/tabs");
const priceService_1 = __importDefault(require("../services/priceService"));
const date_fns_1 = require("date-fns");
const PriceChart = () => {
    const { priceData, isLoading, error, fetchPrice, fetchHistoricalData } = (0, priceService_1.default)();
    (0, react_1.useEffect)(() => {
        fetchPrice();
        fetchHistoricalData(7); // Fetch 7 days of historical data
        const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const formatXAxis = (timestamp) => {
        return (0, date_fns_1.format)(timestamp, 'MMM d, HH:mm');
    };
    const formatYAxis = (value) => {
        return `$${value.toFixed(2)}`;
    };
    if (isLoading) {
        return (<card_1.Card>
        <card_1.CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card>
        <card_1.CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-destructive">{error}</div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>SOL Price Chart</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs defaultValue="24h">
          <tabs_1.TabsList className="grid w-full grid-cols-4">
            <tabs_1.TabsTrigger value="1h">1H</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="24h">24H</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="7d">7D</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="30d">30D</tabs_1.TabsTrigger>
          </tabs_1.TabsList>
          
          <tabs_1.TabsContent value="1h" className="h-[400px]">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.LineChart data={priceData.slice(-60)}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={formatXAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.Tooltip labelFormatter={(timestamp) => (0, date_fns_1.format)(timestamp, 'MMM d, yyyy HH:mm:ss')} formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}/>
                <recharts_1.Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false}/>
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="24h" className="h-[400px]">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.LineChart data={priceData.slice(-1440)}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={formatXAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.Tooltip labelFormatter={(timestamp) => (0, date_fns_1.format)(timestamp, 'MMM d, yyyy HH:mm:ss')} formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}/>
                <recharts_1.Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false}/>
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="7d" className="h-[400px]">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.LineChart data={priceData.slice(-10080)}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={formatXAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.Tooltip labelFormatter={(timestamp) => (0, date_fns_1.format)(timestamp, 'MMM d, yyyy HH:mm:ss')} formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}/>
                <recharts_1.Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false}/>
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="30d" className="h-[400px]">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.LineChart data={priceData.slice(-43200)}>
                <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                <recharts_1.XAxis dataKey="timestamp" tickFormatter={formatXAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }}/>
                <recharts_1.Tooltip labelFormatter={(timestamp) => (0, date_fns_1.format)(timestamp, 'MMM d, yyyy HH:mm:ss')} formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}/>
                <recharts_1.Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false}/>
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>);
};
exports.default = PriceChart;
