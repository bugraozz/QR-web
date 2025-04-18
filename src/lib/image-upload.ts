import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Define the uploads directory path
const uploadsDir = path.join(process.cwd(), "public", "uploads")

// Ensure the uploads directory exists
export function ensureUploadsDir() {
  // Create the main uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  // Create a products subdirectory
  const productsDir = path.join(uploadsDir, "products")
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true })
  }

  return {
    uploadsDir,
    productsDir,
  }
}

// Save a base64 image to the uploads directory
export function saveBase64Image(base64Image: string, subdir = "products"): string {
  // Ensure directories exist
  const { uploadsDir } = ensureUploadsDir()

  // Create the subdirectory if it doesn't exist
  const targetDir = path.join(uploadsDir, subdir)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // Extract the image data and format from the base64 string
  const matches = base64Image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image format")
  }

  const imageFormat = matches[1]
  const imageData = matches[2]

  // Generate a unique filename
  const filename = `${uuidv4()}.${imageFormat}`
  const filePath = path.join(targetDir, filename)

  // Write the file
  fs.writeFileSync(filePath, Buffer.from(imageData, "base64"))

  // Return the public URL path
  return `/uploads/${subdir}/${filename}`
}

// Delete an image from the uploads directory
export function deleteImage(imagePath: string): boolean {
  try {
    // Extract the file path relative to the public directory
    const relativePath = imagePath.replace(/^\//, "")
    const fullPath = path.join(process.cwd(), "public", relativePath)

    // Check if the file exists
    if (fs.existsSync(fullPath)) {
      // Delete the file
      fs.unlinkSync(fullPath)
      return true
    }

    return false
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}

