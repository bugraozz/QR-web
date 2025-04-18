"use client"

import type React from "react"
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { checkAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, MoreHorizontal, Search, Edit, Trash, ImagePlus, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"

interface Category {
  id: number
  category_name: string
  slug: string
  created_at: string
  image_path?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

  // Image upload states
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [editUploadedImage, setEditUploadedImage] = useState<string>("")
  const [editUploading, setEditUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Define fetchCategories before useEffect
  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>("/api/admin/addcategories")
      setCategories(response.data)
    } catch (error) {
      console.error("Fetch categories error:", error.response?.data || error.message)
    }
  }

  useEffect(() => {
    checkAuth(router.push, setIsAuthenticated);
    fetchCategories();
  }, [router]);

  if (!isAuthenticated) {
    return null; // Render nothing while checking authentication
  }

  const filteredCategories = categories.filter((category) =>
    category.category_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const addCategory = async (name: string, slug: string) => {
    try {
      if (!name || !slug) {
        console.error("Name and slug are required")
        return
      }

      console.log("Sending category data:", { name, slug, image_path: uploadedImage })

      const response = await axios.post<Category>("/api/admin/addcategories", {
        name, // Burada "name" kullanıyoruz
        slug,
        image_path: uploadedImage,
      })

      await fetchCategories() // Refresh the list
      setUploadedImage("") // Reset the image
    } catch (error) {
      console.error("Add category error:", error.response?.data || error.message)
    }
  }

  const deleteCategory = async (categoryId: number) => {
    try {
      await axios.delete(`/api/admin/categories/${categoryId}`);
      setCategories(categories.filter((c) => c.id !== categoryId));
    } catch (error) {
      console.error("Delete category error:", error);
    }
  }

  // Handle image upload for new category
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    try {
      const file = e.target.files[0]

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const response = await axios.post("/api/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        setUploadedImage(response.data.filePath)
      }
    } catch (err: any) {
      console.error("Failed to upload image:", err)
    } finally {
      setUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle image upload for editing category
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setEditUploading(true)
    try {
      const file = e.target.files[0]

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const response = await axios.post("/api/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        setEditUploadedImage(response.data.filePath)
      }
    } catch (err: any) {
      console.error("Failed to upload image:", err)
    } finally {
      setEditUploading(false)
      // Reset the file input
      if (editFileInputRef.current) {
        editFileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font bold tracking-tight">Categories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>Enter the name of the new category.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" type="text" required placeholder="Enter category name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" type="text" required placeholder="Enter slug" />
                <p className="text-sm text-muted-foreground">Used in the URL:/ category/[slug]</p>
              </div>

              {/* Image Upload Section */}
              <div className="grid gap-2">
                <Label htmlFor="image">Category Image (Optional)</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                    <div className="flex flex-col items-center space-y-2">
                      {uploading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Uploading image...</div>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Click to upload a category image</div>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault() // Prevent form submission
                               fileInputRef.current?.click()}}
                            disabled={uploading}
                          >
                            Select Image
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {uploadedImage && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden border">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Category image"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => setUploadedImage("")}
                      >
                        <span className="sr-only">Remove</span>×
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setUploadedImage("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault()
                    const name = (document.getElementById("name") as HTMLInputElement).value
                    const slug = (document.getElementById("slug") as HTMLInputElement).value
                    setIsAddDialogOpen(false)
                    addCategory(name, slug)
                  }}
                >
                  Add Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image_path ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                          <img
                            src={category.image_path || "/placeholder.svg"}
                            alt={category.category_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.category_name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.created_at}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/categories/${category.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

