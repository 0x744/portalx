"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const PortalXHelp = () => {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>PortalX Help Center</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Main Features</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <lucide_react_1.Wallet className="h-5 w-5 mt-1"/>
              <div>
                <h4 className="font-medium">Wallet Management</h4>
                <p className="text-sm text-muted-foreground">
                  Generate and manage multiple Solana wallets for volume generation and token operations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <lucide_react_1.Package className="h-5 w-5 mt-1"/>
              <div>
                <h4 className="font-medium">Token Bundler</h4>
                <p className="text-sm text-muted-foreground">
                  Launch tokens with advanced features like Jito bundling and auto-scaling tips.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <lucide_react_1.BarChart className="h-5 w-5 mt-1"/>
              <div>
                <h4 className="font-medium">Analytics Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor real-time volume, holder statistics, and transaction performance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <lucide_react_1.Shield className="h-5 w-5 mt-1"/>
              <div>
                <h4 className="font-medium">Security Features</h4>
                <p className="text-sm text-muted-foreground">
                  Encrypted wallet storage and 2FA protection for sensitive operations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Getting Started</h3>
          <div className="space-y-2">
            <h4 className="font-medium">1. Wallet Setup</h4>
            <p className="text-sm text-muted-foreground">
              Generate or import your Solana wallets. Make sure to securely store your private keys.
            </p>

            <h4 className="font-medium">2. Token Launch</h4>
            <p className="text-sm text-muted-foreground">
              Configure your token parameters and launch it with advanced features like Jito bundling.
            </p>

            <h4 className="font-medium">3. Volume Generation</h4>
            <p className="text-sm text-muted-foreground">
              Use the wallet manager to generate volume and manage token operations.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Support</h3>
          <p className="text-sm text-muted-foreground">
            For additional support, please contact our team at support@portalx.com
          </p>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
};
exports.default = PortalXHelp;
