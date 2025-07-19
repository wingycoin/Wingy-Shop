import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Coins, User, Star, Heart } from "lucide-react";

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

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyClick: (product: Product) => void;
  sellerUsername?: string;
}

function ProductModal({ product, isOpen, onClose, onBuyClick, sellerUsername }: ProductModalProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold wingy-purple">Product Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Image */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-wingy-gold flex items-center">
                <Coins className="mr-1 w-5 h-5" />
                {parseFloat(product.price).toFixed(3)} WC
              </span>
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-wingy-purple text-white">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-gray-700">@{sellerUsername || 'seller'}</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-700">4.8 (24 reviews)</span>
              </div>
            </div>
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button 
                className="flex-1 bg-wingy-gold text-wingy-black font-semibold hover:bg-yellow-400"
                onClick={() => onBuyClick(product)}
                disabled={product.stock === 0}
              >
                <Coins className="mr-2 w-4 h-4" />
                {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductModal;
