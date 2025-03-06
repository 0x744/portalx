import React, { useState, useEffect, useCallback, memo } from 'react';
import { Button } from './button';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Home, PlusCircle, Zap, Wallet, BarChart2, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import WalletSummary from './WalletSummary';
import TokenLaunchModal from './TokenLaunchModal';

// Memoized nav items to prevent unnecessary re-renders
const navItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/token-launch", icon: PlusCircle, label: "Token Launch" },
  { href: "/sniper", icon: Zap, label: "Sniper" },
  { href: "/wallets", icon: Wallet, label: "Wallets" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

// Memoized NavItem component to prevent unnecessary re-renders
const NavItem = memo(({ 
  item, 
  isActive 
}: { 
  item: typeof navItems[number]; 
  isActive: boolean;
}) => (
  <li>
    <Button 
      variant={isActive ? "secondary" : "ghost"} 
      className="w-full justify-start"
      asChild
    >
      <Link to={item.href} className="flex items-center">
        <item.icon className="mr-2 h-4 w-4" />
        {item.label}
      </Link>
    </Button>
  </li>
));

NavItem.displayName = 'NavItem';

// Memoized UserProfile component to prevent unnecessary re-renders
const UserProfile = memo(({ currentTime }: { currentTime: Date }) => {
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  return (
    <div className="p-4 border-t border-border mt-auto">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="User avatar" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">username</span>
          <span className="text-xs text-muted-foreground">Lifetime</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {formatTime(currentTime)}
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

const Sidebar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-64 bg-card h-[calc(100vh-2rem)] hidden lg:flex flex-col border-r border-border">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem 
              key={item.href} 
              item={item} 
              isActive={location.pathname === item.href} 
            />
          ))}
        </ul>
      </nav>
      
      <div className="px-4 flex-1">
        <div className="mt-4">
          <TokenLaunchModal />
        </div>
        
        <div className="mt-4 flex justify-end">
          <ThemeToggle />
        </div>
        
        <WalletSummary />
      </div>

      <UserProfile currentTime={currentTime} />
    </div>
  );
};

export default memo(Sidebar); 