"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const TopBar_1 = __importDefault(require("./ui/TopBar"));
const Sidebar_1 = __importDefault(require("./ui/Sidebar"));
const next_themes_1 = require("next-themes");
// Import pages
const Dashboard_1 = __importDefault(require("../pages/Dashboard"));
const TokenLaunch_1 = __importDefault(require("../pages/TokenLaunch"));
const Sniper_1 = __importDefault(require("../pages/Sniper"));
const Wallets_1 = __importDefault(require("../pages/Wallets"));
const Analytics_1 = __importDefault(require("../pages/Analytics"));
const Settings_1 = __importDefault(require("../pages/Settings"));
const PortalXBundler = () => {
    return (<next_themes_1.ThemeProvider attribute="class" defaultTheme="dark">
      <react_router_dom_1.BrowserRouter>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <TopBar_1.default />
          <div className="flex flex-1">
            <Sidebar_1.default />
            <div className="flex-1 flex flex-col">
              <main className="container mx-auto px-4 py-8 flex-1">
                <react_router_dom_1.Routes>
                  <react_router_dom_1.Route path="/" element={<Dashboard_1.default />}/>
                  <react_router_dom_1.Route path="/token-launch" element={<TokenLaunch_1.default />}/>
                  <react_router_dom_1.Route path="/sniper" element={<Sniper_1.default />}/>
                  <react_router_dom_1.Route path="/wallets" element={<Wallets_1.default />}/>
                  <react_router_dom_1.Route path="/analytics" element={<Analytics_1.default />}/>
                  <react_router_dom_1.Route path="/settings" element={<Settings_1.default />}/>
                </react_router_dom_1.Routes>
              </main>
            </div>
          </div>
        </div>
      </react_router_dom_1.BrowserRouter>
    </next_themes_1.ThemeProvider>);
};
exports.default = PortalXBundler;
