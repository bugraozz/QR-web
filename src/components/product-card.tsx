"use client"

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ImageOff } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Badge } from "@/components/ui/badge";

// Update the Product interface to match your actual data structure
interface Product {
  id: number
  name: string
  description: string
  price: number | string
  image_path?: string // New field for local image path
  category_id?: number
  category_name?: string
  status?: string
}

interface ProductCard3DProps {
  product: Product
}

export function ProductCard3D({ product }: ProductCard3DProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  console.log("Rendered product:", product); // ✅ Konsolda veriyi kontrol et

  const imagePath = product.image_path || "/placeholder.svg";

  const formattedPrice =
    typeof product.price === "number" ? product.price.toFixed(2) : Number.parseFloat(String(product.price)).toFixed(2);


  const handleImageError = () => {
    console.error(`Image failed to load for product ${product.id}:`, imagePath);
    setImageError(true);
  };

  return (
    <CardContainer className="w-full">
      <CardBody className="bg-white relative group/card dark:bg-zinc-900 border  border-zinc-200 dark:border-zinc-800 w-full h-full rounded-xl p-2">
        <CardItem translateZ="50" className="text-xl font-bold text-zinc-800  dark:text-white">
          {product.name}
        </CardItem>

        

        <CardItem translateZ="100" className="w-full mt-2">
          <div className="aspect-video relative w-full h-48 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {imageError ? (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageOff size={32} />
                <span className="text-sm mt-2">Image not available</span>
              </div>
            ) : (
              <img
                src={imagePath}
                alt={product.name}
                className="object-cover w-full h-full group-hover/card:shadow-xl"
                onError={handleImageError}
              />
            )}
          </div>
        </CardItem>

        <div className="flex justify-between items-center mt-6 space-x-1">
          <CardItem translateZ={20} className="flex-1 px-2 py-2 rounded-xl text-lg font-bold text-zinc-800 dark:text-white whitespace-nowrap">
            ${formattedPrice}
          </CardItem>

          <CardItem translateZ={20}>
            <Badge
              className="text-[10px] sm:text-xs px-2 py-1 truncate"
              variant={
                product.status === "Active"
                  ? "default"
                  : product.status === "Out of Stock"
                  ? "destructive"
                  : "outline"
              }
            >
              {product.status}
            </Badge>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
