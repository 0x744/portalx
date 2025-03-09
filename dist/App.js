"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const tabs_1 = require("@/components/ui/tabs");
const PortalXDashboard_1 = __importDefault(require("@/components/PortalXDashboard"));
const PortalXTokenEditor_1 = __importDefault(require("@/components/PortalXTokenEditor"));
const PortalXHelp_1 = __importDefault(require("@/components/PortalXHelp"));
const next_themes_1 = require("next-themes");
const button_1 = require("@/components/ui/button");
const lucide_react_2 = require("lucide-react");
const theme_provider_1 = require("@/components/theme-provider");
require("@/index.css");
function PortalXApp() {
    const { setTheme, theme } = (0, next_themes_1.useTheme)();
    return (<theme_provider_1.ThemeProvider defaultTheme="dark" storageKey="portalx-theme">
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <lucide_react_1.Package className="h-6 w-6"/>
              <span>PortalX</span>
            </div>
            <div className="flex items-center gap-2">
              <button_1.Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? (<lucide_react_2.Sun className="h-5 w-5"/>) : (<lucide_react_2.Moon className="h-5 w-5"/>)}
              </button_1.Button>
              <button_1.Button variant="ghost" size="icon" onClick={() => setTheme('blue')}>
                <lucide_react_2.Palette className="h-5 w-5"/>
              </button_1.Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-6">
          <tabs_1.Tabs defaultValue="dashboard" className="space-y-4">
            <tabs_1.TabsList>
              <tabs_1.TabsTrigger value="dashboard">Dashboard</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="editor">Token Editor</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="help">Help</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="dashboard">
              <PortalXDashboard_1.default />
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="editor">
              <PortalXTokenEditor_1.default />
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="help">
              <PortalXHelp_1.default />
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </main>
      </div>
    </theme_provider_1.ThemeProvider>);
}
exports.default = PortalXApp;
