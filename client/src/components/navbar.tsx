import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { Coins, User, Menu, X, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  balance: string;
  isAdmin: boolean;
  wingyCoinUserId?: string;
  wingyBalance?: number;
  completedAds?: number;
}

function Navbar() {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!localStorage.getItem('token'),
  });

  // Use user verification effect similar to mobile app
  useEffect(() => {
    const verifyUser = async () => {
      if (!user?.id) {
        return;
      }

      try {
        // Verify user exists in backend and get fresh data
        const userData = await apiRequest("GET", `/api/user/${user.id}`);
        if (!userData.user) {
          // User not found in backend, logout
          logout();
          return;
        }

        // User data is automatically updated through the API call
        console.log('User verified:', userData.user);
      } catch (err) {
        console.error('Error verifying user:', err);
        // Error verifying user, logout
        logout();
      }
    };

    verifyUser();
  }, [user?.id]);

  // Fetch fresh balance every 30 seconds
  const { data: balanceData } = useQuery({
    queryKey: ['/api/check-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest("POST", "/api/check-balance", { userId: user.id });
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  const logout = () => {
    localStorage.removeItem('token');
    setLocation('/');
  };

  return (
    <nav className="bg-background border-b shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Coins className="text-primary text-2xl mr-2" />
              <span className="text-2xl font-bold text-primary">Wingy Shop</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/marketplace" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Marketplace
              </Link>
              <Link href="/sell" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Sell
              </Link>
              <Link href="/my-orders" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                My Orders
              </Link>
              <Link href="/my-listings" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                My Listings
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <Link href="/get-wingy" className="hidden sm:block">
                  <Badge className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
                    <Coins className="mr-1 w-4 h-4" />
                    {(balanceData?.wingy || user.wingyBalance || 0).toFixed(3)} WC
                  </Badge>
                </Link>
                <Link href="/get-wingy" className="sm:hidden">
                  <Badge className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors cursor-pointer text-xs px-2">
                    <Coins className="mr-1 w-3 h-3" />
                    {(balanceData?.wingy || user.wingyBalance || 0).toFixed(1)} WC
                  </Badge>
                </Link>
                <div className="hidden sm:flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground hidden lg:block">@{user.username || 'user'}</span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setLocation('/login')}>
                  Login
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLocation('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/marketplace" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Marketplace
            </Link>
            <Link href="/sell" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              Sell
            </Link>
            {user && (
              <>
                <Link href="/my-orders" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  My Orders
                </Link>
                <Link href="/my-listings" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  My Listings
                </Link>
                {user?.isAdmin && (
                  <Link href="/admin" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
          
          {/* Mobile User Section */}
          {user ? (
            <div className="border-t px-2 py-3">
              <div className="flex items-center space-x-3 px-3 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">@{user.username || 'user'}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="px-3 py-2 space-y-2">
                <Link href="/get-wingy" className="block">
                  <Badge className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors cursor-pointer w-full justify-center">
                    <Coins className="mr-1 w-4 h-4" />
                    {(balanceData?.wingy || user.wingyBalance || 0).toFixed(3)} WC
                  </Badge>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="w-full">
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t px-2 py-3">
              <div className="space-y-2 px-3">
                <Button variant="outline" size="sm" onClick={() => { setLocation('/login'); setIsMobileMenuOpen(false); }} className="w-full">
                  Login
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full" onClick={() => { setLocation('/signup'); setIsMobileMenuOpen(false); }}>
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
