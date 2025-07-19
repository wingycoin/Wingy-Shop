import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Coins, ShoppingCart, Plus, TrendingUp, Shield, Users, ChartLine } from "lucide-react";
import ProductCard from "@/components/product-card";
import ProductModal from "@/components/product-modal";
import TransactionModal from "@/components/transaction-modal";
import { useState } from "react";

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  stock: number;
  imageUrl?: string;
  tags?: string[];
  sellerId: number;
  status: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  balance: string;
  isAdmin: boolean;
}

function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products?status=active');
      return response.json();
    },
  });

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!localStorage.getItem('token'),
  });

  // Fetch live transaction stats from Wingy Coin API
  const { data: transactionStats } = useQuery({
    queryKey: ['/api/wingy-stats'],
    queryFn: async () => {
      const response = await fetch('https://api.wingycoin.com/statics/all-transactions');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 50000, // Consider data stale after 50 seconds
  });

  // Helper function to format numbers with proper abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setIsTransactionModalOpen(true);
  };

  const featuredProducts = products?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-bg py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight">
              Trade with <span className="text-white font-extrabold">Wingy Coins</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
              Buy and sell products using your Wingy Coins. Secure transactions, instant confirmations, and a growing marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/marketplace">
                <Button className="btn-primary font-semibold px-8 py-4 text-lg bg-white text-blue-600 hover:bg-blue-50 border-2 border-white shadow-lg transform hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Start Shopping
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" className="bg-blue-600 border-2 border-blue-600 text-white font-semibold px-8 py-4 text-lg hover:bg-blue-700 hover:border-blue-700 backdrop-blur-sm bg-white/10 transition-all duration-200 w-full sm:w-auto">
                  <Plus className="mr-2 w-5 h-5" />
                  List a Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Trusted by Thousands</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Join our growing community of buyers and sellers</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">15K+</div>
              <div className="text-muted-foreground text-sm sm:text-base">Active Users</div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
                {transactionStats?.totalAmount 
                  ? formatNumber(transactionStats.totalAmount)
                  : '3.2M'
                }
              </div>
              <div className="text-muted-foreground text-sm sm:text-base">Wingy Coins Traded</div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
                {transactionStats?.count 
                  ? formatNumber(transactionStats.count)
                  : products?.length || 0
                }
              </div>
              <div className="text-muted-foreground text-sm sm:text-base">
                {transactionStats?.count ? 'Total Transactions' : 'Products Listed'}
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">99.2%</div>
              <div className="text-muted-foreground text-sm sm:text-base">Transaction Success</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 sm:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">Featured Products</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Discover the best products in our marketplace</p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" className="w-full sm:w-auto">
                View All Products
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse h-full">
                  <div className="aspect-video bg-muted"></div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onBuyClick={handleBuyClick}
                  onCardClick={handleProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Coins className="w-12 h-12 text-primary opacity-60" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">No Products Available</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-6 max-w-md mx-auto">
                Be the first to list a product and start earning Wingy Coins today!
              </p>
              <Link href="/sell">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                  <Plus className="mr-2 w-4 h-4" />
                  List Your Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">Manage Your Wingy Shop</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary rounded-full p-3">
                    <ChartLine className="text-primary-foreground w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Track Your Sales</h3>
                    <p className="text-muted-foreground">Monitor your earnings and transaction history in real-time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary rounded-full p-3">
                    <Shield className="text-primary-foreground w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure Transactions</h3>
                    <p className="text-muted-foreground">All transactions require confirmation from both parties</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary rounded-full p-3">
                    <Users className="text-primary-foreground w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Admin Support</h3>
                    <p className="text-muted-foreground">Product listings reviewed and approved by our team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="bg-muted rounded-xl p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Your Dashboard</h3>
              
              {user ? (
                <>
                  <div className="bg-card rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Balance</p>
                        <p className="text-2xl font-bold text-primary flex items-center">
                          <Coins className="text-primary mr-1 w-6 h-6" />
                          {parseFloat(user.balance).toFixed(3)} WC
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="text-lg font-semibold text-green-600">+15%</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Active Listings</p>
                      <p className="text-xl font-bold wingy-purple">0</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-xl font-bold wingy-purple">0</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Get Started</h4>
                    <p className="text-sm text-gray-600 mb-2">Ready to start trading?</p>
                    <Link href="/sell">
                      <Button size="sm" className="bg-wingy-gold text-wingy-black hover:bg-yellow-400">
                        Create Your First Listing
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Join Wingy Shop</h4>
                  <p className="text-sm text-gray-600 mb-4">Sign up to start buying and selling with Wingy Coins</p>
                  <Link href="/register">
                    <Button className="bg-wingy-gold text-wingy-black hover:bg-yellow-400">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onBuyClick={handleBuyClick}
      />
      
      <TransactionModal
        product={selectedProduct}
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </div>
  );
}

export default Home;
