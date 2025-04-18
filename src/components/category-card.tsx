"use client";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { ImageOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { BackgroundGradient } from "@/components/ui/background-gradient";

interface Category {
  id: number;
  category_name: string;
  slug: string;
  image_path: string;
}

export default function CategoryCard3D() {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>("/api/admin/addcategories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleImageError = (categoryId: number) => {
    console.error(`Image failed to load for category ${categoryId}`);
    setImageError(true);
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="max-w-screen-xl w-full px-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 ">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group">
              <CardContainer className="w-full">
                <CardBody className="bg-white relative group/card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full h-full rounded-xl overflow-hidden">
                  <div className="relative w-full h-64">
                    <img
                      src={category.image_path || "/placeholder.svg"}
                      alt={category.category_name}
                      className="object-cover w-full h-full"
                      onError={() => handleImageError(category.id)}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 text-center text-lg font-semibold text-zinc-800 dark:text-white py-2">
                    {category.category_name}
                  </div>
                </CardBody>
              </CardContainer>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
