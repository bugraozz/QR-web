"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { ArrowLeft, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: number
  name: string
  description: string
  images: string[]
  price: number
  category_id: number
  category_name: string
  status: string
}

export default function ProductsPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    if (id) {
      fetchProductDetails()
    }
  }, [id])

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get<Product>(`/api/admin/products/${id}`)
      if (response.status === 200) {
        setProduct(response.data)
        setLoading(false)
      } else {
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
    }
  }

  const handlePrevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diffX = touchStartX - touchEndX

    if (diffX > 50) {
      handleNextImage() // Sağa kaydırma
    } else if (diffX < -50) {
      handlePrevImage() // Sola kaydırma
    }

    setTouchStartX(null)
  }

  const goBack = () => {
    router.back()
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )

  if (!product)
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-xl">Product not found.</div>
      </div>
    )

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Product Image Section */}
      <div
        className="relative w-full h-[70vh] bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Back Button */}
        <button onClick={goBack} className="absolute top-4 left-4 z-10 text-white p-2 rounded-full bg-black/30">
          <ArrowLeft size={24} />
        </button>

        {/* Previous Image Button */}
        <button
          onClick={handlePrevImage}
          className="absolute top-1/2 left-4 z-10 text-white p-2 rounded-full bg-black/30 transform -translate-y-1/2"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Product Image */}
        <img
          src={product.images[currentImageIndex] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {/* Next Image Button */}
        <button
          onClick={handleNextImage}
          className="absolute top-1/2 right-4 z-10 text-white p-2 rounded-full bg-black/30 transform -translate-y-1/2"
        >
          <ArrowLeft size={24} className="rotate-180" />
        </button>

        {/* Product Name Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-white text-2xl font-medium">{product.name}</h1>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-6 flex flex-col">
        <p className="text-black-800 text-base mb-4 font-semibold">{product.description}</p>

        {/* Price */}
        <div className="flex items-center">
          <span className=" rounded-xl text-lg font-bold text-zinc-800 dark:text-white">
            $ {typeof product.price === "number" ? product.price.toFixed(2) : product.price}
          </span>
        </div>
      </div>
    </div>
  )
}

