import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

interface TransactionModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  sellerUsername?: string;
}

function TransactionModal({ product, isOpen, onClose, sellerUsername }: TransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Get user profile with balance
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!localStorage.getItem('token'),
  });

  // Get fresh balance
  const { data: balanceData } = useQuery({
    queryKey: ['/api/check-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await apiRequest("POST", "/api/check-balance", { userId: user.id });
      return response.json();
    },
    enabled: !!user?.id,
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("POST", "/api/transactions", { productId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction Created",
        description: "Your purchase request has been submitted. Both parties must confirm the transaction.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  if (!product) return null;

  const handleConfirmPurchase = () => {
    const currentBalance = balanceData?.wingy || user?.wingyBalance || 0;
    const productPrice = parseFloat(product.price);
    
    if (currentBalance < productPrice) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough Wingy Coins to make this purchase.",
        variant: "destructive",
      });
      onClose();
      setLocation('/get-wingy');
      return;
    }

    createTransactionMutation.mutate(product.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-wingy-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="text-wingy-black text-2xl" />
            </div>
            <DialogTitle className="text-xl font-bold wingy-purple">Confirm Transaction</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-wingy-gray p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Purchase Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-medium">{product.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="text-wingy-gold font-bold flex items-center">
                  <Coins className="mr-1 w-4 h-4" />
                  {parseFloat(product.price).toFixed(3)} WC
                </span>
              </div>
              <div className="flex justify-between">
                <span>Seller:</span>
                <span>@{sellerUsername || 'seller'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-sm text-yellow-800">
                Both you and the seller must confirm this transaction before coins are transferred.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button 
              className="flex-1 bg-wingy-gold text-wingy-black font-semibold hover:bg-yellow-400"
              onClick={handleConfirmPurchase}
              disabled={createTransactionMutation.isPending}
            >
              {createTransactionMutation.isPending ? "Processing..." : "Confirm Purchase"}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
              disabled={createTransactionMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionModal;
