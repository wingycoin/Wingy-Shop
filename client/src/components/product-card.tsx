import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Coins, User } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  onBuyClick: (product: Product) => void;
  onCardClick: (product: Product) => void;
  sellerUsername?: string;
}

function ProductCard({ product, onBuyClick, onCardClick, sellerUsername }: ProductCardProps) {
  return (
    <Card className="overflow-hidden card-hover cursor-pointer transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-0 bg-card dark:bg-card h-full flex flex-col" onClick={() => onCardClick(product)}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="text-center">
              <Coins className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-primary opacity-60" />
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="text-xs">
              Low Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          <h3 className="font-semibold text-lg sm:text-xl text-foreground mb-2 line-clamp-2 leading-tight">{product.title}</h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-3 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-primary font-bold text-lg sm:text-xl flex items-center">
              <Coins className="mr-1 w-4 h-4 sm:w-5 sm:h-5" />
              {parseFloat(product.price).toFixed(3)} WC
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Stock: {product.stock}
            </span>
          </div>
          
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs hover:bg-primary/10 transition-colors">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-3 mt-auto">
          <div className="flex items-center">
            <Avatar className="w-6 h-6 sm:w-7 sm:h-7">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm text-muted-foreground truncate">
              @{sellerUsername || 'seller'}
            </span>
          </div>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onBuyClick(product);
            }}
            disabled={product.stock === 0}
          >
            <Coins className="mr-1 w-4 h-4" />
            {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
