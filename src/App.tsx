import React from 'react';
import { Package } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PortalXDashboard from '@/components/PortalXDashboard';
import PortalXTokenEditor from '@/components/PortalXTokenEditor';
import PortalXHelp from '@/components/PortalXHelp';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import '@/index.css';

function PortalXApp() {
  const { setTheme, theme } = useTheme();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="portalx-theme">
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Package className="h-6 w-6" />
              <span>PortalX</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme('blue')}
              >
                <Palette className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-6">
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="editor">Token Editor</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <PortalXDashboard />
            </TabsContent>

            <TabsContent value="editor">
              <PortalXTokenEditor />
            </TabsContent>

            <TabsContent value="help">
              <PortalXHelp />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default PortalXApp; 