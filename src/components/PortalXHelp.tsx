import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Package, BarChart, Shield } from 'lucide-react';

const PortalXHelp: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PortalX Help Center</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Main Features</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Wallet className="h-5 w-5 mt-1" />
              <div>
                <h4 className="font-medium">Wallet Management</h4>
                <p className="text-sm text-muted-foreground">
                  Generate and manage multiple Solana wallets for volume generation and token operations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Package className="h-5 w-5 mt-1" />
              <div>
                <h4 className="font-medium">Token Bundler</h4>
                <p className="text-sm text-muted-foreground">
                  Launch tokens with advanced features like Jito bundling and auto-scaling tips.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <BarChart className="h-5 w-5 mt-1" />
              <div>
                <h4 className="font-medium">Analytics Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor real-time volume, holder statistics, and transaction performance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Shield className="h-5 w-5 mt-1" />
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
      </CardContent>
    </Card>
  );
};

export default PortalXHelp; 