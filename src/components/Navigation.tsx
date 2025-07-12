
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from './ui/button';
import { Bell, Search, User, Settings, Users, BarChart3 } from 'lucide-react';
import { Badge } from './ui/badge';
import { getSwapRequests } from '@/lib/storage';
import { useEffect, useState } from 'react';

export const Navigation = () => {
  const location = useLocation();
  const { user } = useUser();
  const [pendingCount, setPendingCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user?.emailAddresses[0]?.emailAddress === 'srivathsasmurthy2005@gmail.com';

  useEffect(() => {
    if (user) {
      const requests = getSwapRequests().filter(
        req => req.status === 'pending' && req.toUserId === user.id
      );
      setPendingCount(requests.length);
    }
  }, [user]);

  return (
    <nav className="bg-background border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-xl font-bold text-primary">
            Skill Swap
          </Link>
          
          <SignedIn>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/search"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/search') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/profile') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive('/admin') 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </SignedIn>
        </div>

        <div className="flex items-center space-x-4">
          <SignedIn>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {pendingCount}
                </Badge>
              )}
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};
