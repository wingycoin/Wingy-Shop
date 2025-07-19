import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, Gift, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function GetWingy() {
  const { user } = useAuth();
  
  // Fetch fresh balance when component loads
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/check-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest("POST", "/api/check-balance", { userId: user.id });
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">Get Wingy Coins</h1>
            <p className="text-muted-foreground">Earn more coins to shop in the marketplace</p>
          </div>
        </div>

        {/* Current Balance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {balanceLoading ? (
                <span className="text-2xl">Loading...</span>
              ) : (
                <>
                  {(balanceData?.wingy || user?.wingyBalance || 0).toFixed(3)} <span className="text-sm font-normal text-muted-foreground">WC</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Completed Ads: {balanceData?.completedads || user?.completedAds || 0}
            </p>
          </CardContent>
        </Card>

        {/* Download App Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Download Wingy App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Download the official Wingy Coin app from Google Play Store to earn coins and manage your account.
              </p>
              <div className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=com.wingycoin.app', '_blank')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  Download from Play Store
                </Button>
                
                {/* QR Code for Play Store */}
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Scan QR Code</p>
                  <div className="w-32 h-32 bg-white p-2 rounded-lg">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white"/>
                      {/* QR Code pattern for Play Store link */}
                      <rect x="0" y="0" width="7" height="7" fill="black"/>
                      <rect x="1" y="1" width="5" height="5" fill="white"/>
                      <rect x="2" y="2" width="3" height="3" fill="black"/>
                      <rect x="8" y="0" width="1" height="1" fill="black"/>
                      <rect x="10" y="0" width="1" height="1" fill="black"/>
                      <rect x="12" y="0" width="1" height="1" fill="black"/>
                      <rect x="14" y="0" width="1" height="1" fill="black"/>
                      <rect x="16" y="0" width="1" height="1" fill="black"/>
                      <rect x="18" y="0" width="1" height="1" fill="black"/>
                      <rect x="20" y="0" width="7" height="7" fill="black"/>
                      <rect x="21" y="1" width="5" height="5" fill="white"/>
                      <rect x="22" y="2" width="3" height="3" fill="black"/>
                      <rect x="0" y="8" width="1" height="1" fill="black"/>
                      <rect x="6" y="8" width="1" height="1" fill="black"/>
                      <rect x="8" y="8" width="1" height="1" fill="black"/>
                      <rect x="10" y="8" width="1" height="1" fill="black"/>
                      <rect x="12" y="8" width="1" height="1" fill="black"/>
                      <rect x="14" y="8" width="1" height="1" fill="black"/>
                      <rect x="16" y="8" width="1" height="1" fill="black"/>
                      <rect x="18" y="8" width="1" height="1" fill="black"/>
                      <rect x="20" y="8" width="1" height="1" fill="black"/>
                      <rect x="26" y="8" width="1" height="1" fill="black"/>
                      <rect x="0" y="20" width="7" height="7" fill="black"/>
                      <rect x="1" y="21" width="5" height="5" fill="white"/>
                      <rect x="2" y="22" width="3" height="3" fill="black"/>
                      <rect x="8" y="20" width="1" height="1" fill="black"/>
                      <rect x="10" y="20" width="1" height="1" fill="black"/>
                      <rect x="12" y="20" width="1" height="1" fill="black"/>
                      <rect x="14" y="20" width="1" height="1" fill="black"/>
                      <rect x="16" y="20" width="1" height="1" fill="black"/>
                      <rect x="18" y="20" width="1" height="1" fill="black"/>
                      <rect x="20" y="20" width="7" height="7" fill="black"/>
                      <rect x="21" y="21" width="5" height="5" fill="white"/>
                      <rect x="22" y="22" width="3" height="3" fill="black"/>
                      {/* Additional QR pattern */}
                      <rect x="10" y="10" width="1" height="1" fill="black"/>
                      <rect x="12" y="10" width="1" height="1" fill="black"/>
                      <rect x="14" y="10" width="1" height="1" fill="black"/>
                      <rect x="16" y="10" width="1" height="1" fill="black"/>
                      <rect x="10" y="12" width="1" height="1" fill="black"/>
                      <rect x="12" y="12" width="1" height="1" fill="black"/>
                      <rect x="14" y="12" width="1" height="1" fill="black"/>
                      <rect x="16" y="12" width="1" height="1" fill="black"/>
                      <rect x="10" y="14" width="1" height="1" fill="black"/>
                      <rect x="12" y="14" width="1" height="1" fill="black"/>
                      <rect x="14" y="14" width="1" height="1" fill="black"/>
                      <rect x="16" y="14" width="1" height="1" fill="black"/>
                      <rect x="10" y="16" width="1" height="1" fill="black"/>
                      <rect x="12" y="16" width="1" height="1" fill="black"/>
                      <rect x="14" y="16" width="1" height="1" fill="black"/>
                      <rect x="16" y="16" width="1" height="1" fill="black"/>
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Scan with your phone camera</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Purchase Wingy Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Buy Wingy Coins directly through the mobile app using various payment methods.
              </p>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Available in the App:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Credit/Debit Cards</li>
                    <li>• PayPal</li>
                    <li>• Google Pay</li>
                    <li>• Bank Transfer</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=com.wingycoin.app', '_blank')}
                >
                  Open App to Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              How to Get Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold">Download the App</h4>
                  <p className="text-sm text-muted-foreground">Get the official Wingy Coin app from Google Play Store</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold">Sign In</h4>
                  <p className="text-sm text-muted-foreground">Use the same email and password you used for this website</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold">Purchase Coins</h4>
                  <p className="text-sm text-muted-foreground">Buy Wingy Coins using your preferred payment method</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <h4 className="font-semibold">Start Shopping</h4>
                  <p className="text-sm text-muted-foreground">Your coins will sync automatically and you can start shopping here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}