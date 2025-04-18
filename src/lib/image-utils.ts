/**
 * Utility functions for handling product images
 */

/**
 * Safely extracts an image URL from a product object that might have different image structures
 * @param product The product object
 * @returns A valid image URL or a placeholder
 */
export function getProductImageUrl(product: any): string {
    // Check if images is an array
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]
    }
  
    // Check if images is a JSON string
    if (typeof product.images === "string") {
      try {
        // Try to parse it as JSON
        const parsedImages = JSON.parse(product.images)
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          return parsedImages[0]
        }
      } catch (e) {
        // If it's not valid JSON, but still a string URL, use it directly
        if (product.images.startsWith("http") || product.images.startsWith("/")) {
          return product.images
        }
      }
    }
  
    // Check if image field exists
    if (product.image) {
      return product.image
    }
  
    // Fallback to placeholder
    return "/placeholder.svg?height=200&width=300"
  }
  
  /**
   * Formats a price value to a consistent string format
   * @param price The price value (can be number or string)
   * @returns Formatted price string with 2 decimal places
   */
  export function formatPrice(price: number | string): string {
    if (typeof price === "number") {
      return price.toFixed(2)
    }
  
    try {
      return Number.parseFloat(price).toFixed(2)
    } catch (e) {
      return "0.00"
    }
  }
  
  