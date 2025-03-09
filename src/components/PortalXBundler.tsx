import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './ui/TopBar';
import Sidebar from './ui/Sidebar';
import { ThemeProvider } from 'next-themes';

// Import pages
import Dashboard from '../pages/Dashboard';
import TokenLaunch from '../pages/TokenLaunch';
import Sniper from '../pages/Sniper';
import Wallets from '../pages/Wallets';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';

const PortalXBundler: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <TopBar />
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <main className="container mx-auto px-4 py-8 flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/token-launch" element={<TokenLaunch />} />
                  <Route path="/sniper" element={<Sniper />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default PortalXBundler; 