"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ImagePlus, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}

interface Product {
  category(arg0: string, category: any): unknown;
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  status: string;
  images: string[];
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, []);



  const fetchProduct = async () => {
    try {
      const response = await axios.get<Product>(`/api/admin/products/${id}`);
      const fetchedProduct = response.data;
  
      console.log("Fetched product:", fetchedProduct);
      console.log("Fetched images (raw):", fetchedProduct.images);
  
      // Gelen `images` alanını doğru formatta ayarlayalım:
      let formattedImages: string[] = [];
  
      if (Array.isArray(fetchedProduct.images)) {
        formattedImages = fetchedProduct.images;
      } else if (typeof fetchedProduct.images === "string") {
        try {
          formattedImages = JSON.parse(fetchedProduct.images); // JSON string ise parse et
        } catch (error) {
          console.error("Image parsing failed:", error);
          formattedImages = []; // Parse edemezsek boş array olarak ayarla
        }
      }
  
      console.log("Formatted images:", formattedImages);
  
      setProduct({
        ...fetchedProduct,
        images: formattedImages,
        category_id: fetchedProduct.category_id || 0,
      });
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  };
  

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/admin/addcategories");
      console.log("Fetched categories response:", response.data);
  
      // API'den gelen kategori isimlerini "Category_name" yerine "name" olarak ayarla
      const formattedCategories = response.data.map((category: any) => ({
        id: category.id,
        name: category.category_name, 
      }));
  
      setCategories(formattedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!product) return;

    setLoading(true);

    try {
      const updatedProduct = {
        ...product,
        images: product.images, // Ensure images are included as an array
      };
      await axios.put(`/api/admin/products/${id}`, updatedProduct);

      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);

    try {
      const uploadedImagePaths = [];

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("/api/admin/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          uploadedImagePaths.push(response.data.filePath);
        }
      }

      if (uploadedImagePaths.length > 0) {
        setProduct((prev) => ({
          ...prev!,
          images: [...(prev?.images || []), ...uploadedImagePaths], // Append new images to the existing array
        }));
        toast({
          title: "Success",
          description: `${uploadedImagePaths.length} image(s) uploaded successfully`,
        });
      }
    } catch (err) {
      console.error("Failed to upload images:", err);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageRemove = async (index: number) => {
    if (!product) return;
  
    const imageToRemove = product.images[index];
  
    try {
      await axios.delete(`/api/admin/products/${product.id}`, {
        data: { image: imageToRemove }, // ✅ API'nin beklediği formatta gönderiyoruz
      });
  
      setProduct((prev) => ({
        ...prev!,
        images: prev!.images.filter((_, i) => i !== index), // ✅ Resmi listeden kaldır
      }));
  
      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };
  

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
  onValueChange={(value) => setProduct((prev) => ({ ...prev!, category_id: parseInt(value) }))}
  value={product.category_id ? product.category_id.toString() : ""}
  key={product.category_id} // Güncellenmeyi zorla
>
  <SelectTrigger>
    <SelectValue placeholder="Select category">{categories.find(cat => cat.id === product.category_id)?.name}</SelectValue>
  </SelectTrigger>
  <SelectContent>
    {categories.map((category) => (
      <SelectItem key={category.id} value={category.id.toString()}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    onValueChange={(value) => setProduct({ ...product, status: value })}
                    value={product.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload and manage product images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-12">
                  <div className="flex flex-col items-center space-y-2">
                    {uploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">Uploading images...</div>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          Drag and drop your images here or click to browse
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          id="image-upload"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          Choose Files
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {product.images.length > 0 ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {product.images.map((image, index) => (
      <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
        <img
          src={image} // Use the image URL
          alt={`Product image ${index + 1}`}
          className="object-cover w-full h-full"
          onError={(e) => {
            console.error("Image failed to load:", image, e);
            e.currentTarget.src = "/placeholder.svg"; // Fallback to a placeholder image
          }}
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => handleImageRemove(index)} // Use the new handler for removing images
        >
          <span className="sr-only">Remove</span>×
        </Button>
      </div>
    ))}
  </div>
) : (
  <p className="text-muted-foreground">No images uploaded.</p>
)}



              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/products">Cancel</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Product
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

