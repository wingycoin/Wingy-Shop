import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Upload, Coins } from "lucide-react";
import { useLocation } from "wouter";

const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be under 500 characters"),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  stock: z.number().min(1, "Stock must be at least 1").max(1000, "Stock cannot exceed 1000"),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

function Sell() {
  const [location, setLocation] = useLocation();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      stock: 1,
      imageUrl: "",
      tags: [],
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to create a product');
      }

      const response = await apiRequest("POST", "/api/products", {
        ...data,
        tags: tags,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Submitted",
        description: "Your product has been submitted for admin approval.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      form.reset();
      setTags([]);
      setLocation('/my-listings');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit product",
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = (data: ProductFormData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a product listing.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    createProductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Sell Your Product</h1>
          <p className="text-muted-foreground">List your product on Wingy Shop and start earning Wingy Coins</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 text-primary" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter product title"
                  className="mt-1"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe your product in detail"
                  className="mt-1"
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (Wingy Coins) *</Label>
                  <div className="relative mt-1">
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register("price")}
                      placeholder="0.00"
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary font-semibold">
                      WC
                    </div>
                  </div>
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="1"
                    {...form.register("stock", { valueAsNumber: true })}
                    placeholder="1"
                    className="mt-1"
                  />
                  {form.formState.errors.stock && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  {...form.register("imageUrl")}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide a direct URL to your product image. For best results, use a high-quality image.
                </p>
              </div>

              <div>
                <Label>Tags (optional)</Label>
                <div className="mt-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1"
                      disabled={tags.length >= 5}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 5}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Add up to 5 tags to help buyers find your product. Press Enter or comma to add.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Review Process</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your product will be reviewed by our admin team before being published to the marketplace. 
                  This usually takes 24-48 hours.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/marketplace')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Sell;
