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
const react_chartjs_2_1 = require("react-chartjs-2");
const chart_js_1 = require("chart.js");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const PortalXBlockchainClient_1 = require("@/utils/PortalXBlockchainClient");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend);
const PortalXDashboard = () => {
    const [volumeData, setVolumeData] = (0, react_1.useState)([]);
    const [holderCount, setHolderCount] = (0, react_1.useState)(0);
    const [totalTransactions, setTotalTransactions] = (0, react_1.useState)(0);
    const [averagePrice, setAveragePrice] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                const client = new PortalXBlockchainClient_1.PortalXBlockchainClient();
                // Fetch dashboard data
                const data = await client.getDashboardData();
                setVolumeData(data.volumeData);
                setHolderCount(data.holderCount);
                setTotalTransactions(data.totalTransactions);
                setAveragePrice(data.averagePrice);
            }
            catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const chartData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
            {
                label: 'Volume (SOL)',
                data: volumeData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '24h Volume Chart'
            }
        }
    };
    return (<div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Volume</card_1.CardTitle>
            <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {volumeData.reduce((a, b) => a + b, 0).toFixed(2)} SOL
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Holders</card_1.CardTitle>
            <lucide_react_1.Wallet className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{holderCount}</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Transactions</card_1.CardTitle>
            <lucide_react_1.Coins className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Avg Price</card_1.CardTitle>
            <lucide_react_1.Settings className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{averagePrice.toFixed(6)} SOL</div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Volume Analytics</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <react_chartjs_2_1.Line data={chartData} options={chartOptions}/>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
};
exports.default = PortalXDashboard;
