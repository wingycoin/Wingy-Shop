import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Coins, User, Clock, CheckCircle, XCircle, Package } from "lucide-react";

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
  completedAt?: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  balance: string;
  isAdmin: boolean;
}

function MyOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!localStorage.getItem('token'),
  });

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/user', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch(`/api/transactions/user/${user?.id}`);
      return response.json();
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      return response.json();
    },
  });

  const confirmTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const response = await apiRequest("PATCH", `/api/transactions/${transactionId}/confirm`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Confirmed",
        description: "Your confirmation has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Confirmation Failed",
        description: error.message || "Failed to confirm transaction",
        variant: "destructive",
      });
    },
  });

  const buyerTransactions = transactions?.filter(t => t.buyerId === user?.id) || [];

  const getProduct = (productId: number) => {
    return products?.find(p => p.id === productId);
  };

  const getStatusBadge = (transaction: Transaction) => {
    switch (transaction.status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>;
      case 'completed':
        return <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Cancelled
        </Badge>;
      default:
        return <Badge variant="secondary">{transaction.status}</Badge>;
    }
  };

  const getConfirmationStatus = (transaction: Transaction) => {
    if (transaction.status === 'completed') {
      return <span className="text-green-600 text-sm">✓ Both parties confirmed</span>;
    }
    
    if (transaction.buyerConfirmed && transaction.sellerConfirmed) {
      return <span className="text-green-600 text-sm">✓ Both parties confirmed</span>;
    }
    
    if (transaction.buyerConfirmed) {
      return <span className="text-blue-600 text-sm">✓ You confirmed, waiting for seller</span>;
    }
    
    if (transaction.sellerConfirmed) {
      return <span className="text-yellow-600 text-sm">Seller confirmed, waiting for you</span>;
    }
    
    return <span className="text-gray-600 text-sm">Waiting for confirmations</span>;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-wingy-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Please login to view your orders</p>
            <Button className="bg-wingy-gold text-wingy-black hover:bg-yellow-400">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wingy-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold wingy-purple mb-2">My Orders</h1>
          <p className="text-gray-600">Track your purchases and transaction history</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : buyerTransactions.length > 0 ? (
          <div className="space-y-4">
            {buyerTransactions.map((transaction) => {
              const product = getProduct(transaction.productId);
              return (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product?.imageUrl ? (
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
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {product?.title || 'Product'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              Order #{transaction.id}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Coins className="w-4 h-4 text-wingy-gold mr-1" />
                                {parseFloat(transaction.amount).toFixed(3)} WC
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            {getStatusBadge(transaction)}
                            {transaction.status === 'pending' && !transaction.buyerConfirmed && (
                              <Button
                                size="sm"
                                className="bg-wingy-gold text-wingy-black hover:bg-yellow-400"
                                onClick={() => confirmTransactionMutation.mutate(transaction.id)}
                                disabled={confirmTransactionMutation.isPending}
                              >
                                {confirmTransactionMutation.isPending ? "Confirming..." : "Confirm Receipt"}
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span>{getConfirmationStatus(transaction)}</span>
                            <div className="flex items-center">
                              <Avatar className="w-6 h-6 mr-2">
                                <AvatarFallback className="bg-wingy-purple text-white">
                                  <User className="w-3 h-3" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-600">Seller ID: {transaction.sellerId}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="max-w-md mx-auto">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't made any purchases yet. Start shopping to see your orders here!
                </p>
                <Button className="bg-wingy-gold text-wingy-black hover:bg-yellow-400">
                  Browse Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
