import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";

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

function MyListings() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!localStorage.getItem('token'),
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/user', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch(`/api/products/user/${user?.id}`);
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending Review
        </Badge>;
      case 'active':
        return <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'active':
        return 'border-green-200 bg-green-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-wingy-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Please login to view your listings</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold wingy-purple mb-2">My Listings</h1>
            <p className="text-gray-600">Manage your product listings and sales</p>
          </div>
          <Link href="/sell">
            <Button className="bg-wingy-gold text-wingy-black hover:bg-yellow-400">
              <Plus className="mr-2 w-4 h-4" />
              Add New Listing
            </Button>
          </Link>
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
        ) : products && products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id} className={`border-2 ${getStatusColor(product.status)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
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
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              Listed: {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-wingy-gold font-semibold">
                              {product.price} WC
                            </span>
                            <span>
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(product.status)}
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            {product.status === 'active' && (
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {product.status === 'pending' && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-yellow-700">
                            Your product is under review. You'll be notified once it's approved.
                          </p>
                        </div>
                      )}
                      
                      {product.status === 'rejected' && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-red-700">
                            Your product was rejected. Please review our guidelines and resubmit.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="max-w-md mx-auto">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't created any product listings yet. Start selling to earn Wingy Coins!
                </p>
                <Link href="/sell">
                  <Button className="bg-wingy-gold text-wingy-black hover:bg-yellow-400">
                    <Plus className="mr-2 w-4 h-4" />
                    Create Your First Listing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MyListings;
