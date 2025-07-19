import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Users, 
  TrendingUp,
  Shield,
  Activity
} from "lucide-react";

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

interface Transaction {
  id: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: string;
  status: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  createdAt: string;
}

function Admin() {
  const [activeTab, setActiveTab] = useState("products");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!localStorage.getItem('token'),
  });

  const { data: pendingProducts, isLoading: pendingLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products/pending'],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const response = await fetch('/api/admin/products/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const response = await fetch('/api/products');
      return response.json();
    },
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
  });

  const updateProductStatusMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/products/${productId}/status`, { status });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Product Updated",
        description: `Product has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update product status",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-wingy-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Please login to access admin panel</p>
            <Button className="bg-wingy-gold text-wingy-black hover:bg-yellow-400">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-wingy-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">You don't have admin privileges to access this page</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = (productId: number) => {
    updateProductStatusMutation.mutate({ productId, status: "active" });
  };

  const handleReject = (productId: number) => {
    updateProductStatusMutation.mutate({ productId, status: "rejected" });
  };

  const stats = {
    totalProducts: allProducts?.length || 0,
    pendingProducts: pendingProducts?.length || 0,
    activeProducts: allProducts?.filter(p => p.status === 'active').length || 0,
    totalTransactions: transactions?.length || 0,
    completedTransactions: transactions?.filter(t => t.status === 'completed').length || 0,
  };

  return (
    <div className="min-h-screen bg-wingy-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold wingy-purple mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage products, users, and platform operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-wingy-gold mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold wingy-purple">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold wingy-purple">{stats.pendingProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold wingy-purple">{stats.activeProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold wingy-purple">{stats.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Product Reviews</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 text-wingy-gold" />
                  Pending Product Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingProducts && pendingProducts.length > 0 ? (
                  <div className="space-y-4">
                    {pendingProducts.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{product.title}</h4>
                              <p className="text-sm text-gray-600 mb-1">Seller ID: {product.sellerId}</p>
                              <p className="text-sm text-gray-500">Price: {product.price} WC</p>
                              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                              <p className="text-sm text-gray-400 mt-1 max-w-md line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pending
                            </Badge>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApprove(product.id)}
                              disabled={updateProductStatusMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(product.id)}
                              disabled={updateProductStatusMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending products</h3>
                    <p className="text-gray-600">All products have been reviewed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 text-wingy-gold" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 text-wingy-gold" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Transaction #{transaction.id}</p>
                            <p className="text-sm text-gray-600">
                              Product ID: {transaction.productId}
                            </p>
                            <p className="text-sm text-gray-600">
                              Buyer: {transaction.buyerId} → Seller: {transaction.sellerId}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-wingy-gold">
                              {transaction.amount} WC
                            </p>
                            <Badge 
                              className={
                                transaction.status === 'completed' ? 'bg-green-600' :
                                transaction.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Transaction history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Admin;
