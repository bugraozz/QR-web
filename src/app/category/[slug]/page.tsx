"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ProductCard3D } from "@/components/product-card";
import { NavbarDemo } from "@/components/navbar";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category_id: number;
  category_name: string;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchProducts();
    } else {
      console.error("Category slug is missing.");
    }
  }, [slug]);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products for category slug:", slug);
      const response = await axios.get<Product[]>(`/api/admin/products?category=${slug}`);
      if (response.status === 200) {
        setProducts(response.data);
      } else {
        console.error("Failed to fetch products:", response.statusText);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <header className=" py-4 px-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center hover:bg-gray-300 text-black font-medium py-2 px-4 rounded"
        >
          <ArrowLeft className="mr-2" size={18} />
        </button>
        <h1
          className="text-3xl font-bold text-center flex-grow text-black"
          style={{
            backgroundImage: "none",
          }}
        >
          Products in {slug}
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-grow p-6">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center">No products found for this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <ProductCard3D product={product} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
