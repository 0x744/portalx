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
const button_1 = require("./button");
const avatar_1 = require("./avatar");
const lucide_react_1 = require("lucide-react");
const react_router_dom_1 = require("react-router-dom");
const ThemeToggle_1 = require("./ThemeToggle");
const WalletSummary_1 = __importDefault(require("./WalletSummary"));
const TokenLaunchModal_1 = __importDefault(require("./TokenLaunchModal"));
// Memoized nav items to prevent unnecessary re-renders
const navItems = [
    { href: "/", icon: lucide_react_1.Home, label: "Dashboard" },
    { href: "/token-launch", icon: lucide_react_1.PlusCircle, label: "Token Launch" },
    { href: "/sniper", icon: lucide_react_1.Zap, label: "Sniper" },
    { href: "/wallets", icon: lucide_react_1.Wallet, label: "Wallets" },
    { href: "/analytics", icon: lucide_react_1.BarChart2, label: "Analytics" },
    { href: "/settings", icon: lucide_react_1.Settings, label: "Settings" },
];
// Memoized NavItem component to prevent unnecessary re-renders
const NavItem = (0, react_1.memo)(({ item, isActive }) => (<li>
    <button_1.Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start" asChild>
      <react_router_dom_1.Link to={item.href} className="flex items-center">
        <item.icon className="mr-2 h-4 w-4"/>
        {item.label}
      </react_router_dom_1.Link>
    </button_1.Button>
  </li>));
NavItem.displayName = 'NavItem';
// Memoized UserProfile component to prevent unnecessary re-renders
const UserProfile = (0, react_1.memo)(({ currentTime }) => {
    const formatTime = (0, react_1.useCallback)((date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }, []);
    return (<div className="p-4 border-t border-border mt-auto">
      <div className="flex items-center space-x-3">
        <avatar_1.Avatar className="h-8 w-8">
          <avatar_1.AvatarImage src="/placeholder.svg" alt="User avatar"/>
          <avatar_1.AvatarFallback>UN</avatar_1.AvatarFallback>
        </avatar_1.Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">username</span>
          <span className="text-xs text-muted-foreground">Lifetime</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {formatTime(currentTime)}
      </div>
    </div>);
});
UserProfile.displayName = 'UserProfile';
const Sidebar = () => {
    const [currentTime, setCurrentTime] = (0, react_1.useState)(new Date());
    const location = (0, react_router_dom_1.useLocation)();
    (0, react_1.useEffect)(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    return (<div className="w-64 bg-card h-[calc(100vh-2rem)] hidden lg:flex flex-col border-r border-border">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (<NavItem key={item.href} item={item} isActive={location.pathname === item.href}/>))}
        </ul>
      </nav>
      
      <div className="px-4 flex-1">
        <div className="mt-4">
          <TokenLaunchModal_1.default />
        </div>
        
        <div className="mt-4 flex justify-end">
          <ThemeToggle_1.ThemeToggle />
        </div>
        
        <WalletSummary_1.default />
      </div>

      <UserProfile currentTime={currentTime}/>
    </div>);
};
exports.default = (0, react_1.memo)(Sidebar);
