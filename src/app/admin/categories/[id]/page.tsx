"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, ImagePlus } from "lucide-react";

interface Category {
  id: number;
  category_name: string;
  slug: string;
  image_path?: string;
}

export default function CategoryEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [editUploadedImage, setEditUploadedImage] = useState<string>("");
  const [editUploading, setEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get<Category>(`/api/admin/categories/${id}`); // Corrected endpoint
        setCurrentCategory(response.data);
      } catch (error) {
        console.error("Failed to fetch category:", error);
      }
    };

    fetchCategory();
  }, [id]);

  const updateCategory = async (category: Category) => {
    try {
      const imageToUse = editUploadedImage || category.image_path;

      await axios.put<Category>(`/api/admin/categories/${category.id}`, {
        ...category,
        image_path: imageToUse,
      });

      router.push("/admin/categories");
    } catch (error) {
      console.error("Update category error:", error);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setEditUploading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setEditUploadedImage(response.data.filePath);
      }
    } catch (err: any) {
      console.error("Failed to upload image:", err);
    } finally {
      setEditUploading(false);
      if (editFileInputRef.current) {
        editFileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Dialog open={!!currentCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Make changes to the category</DialogDescription>
          </DialogHeader>
          {currentCategory && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const nameInput = document.getElementById("edit-name") as HTMLInputElement;
                const slugInput = document.getElementById("edit-slug") as HTMLInputElement;

                updateCategory({
                  ...currentCategory,
                  category_name: nameInput.value,
                  slug: slugInput.value,
                  image_path: editUploadedImage || currentCategory.image_path,
                });
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input id="edit-name" name="name" type="text" required defaultValue={currentCategory.category_name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input id="edit-slug" name="slug" type="text" required defaultValue={currentCategory.slug} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Category Image</Label>
                <div className="flex flex-col gap-4">
                  {(currentCategory.image_path || editUploadedImage) && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden border">
                      <img
                        src={editUploadedImage || currentCategory.image_path || "/placeholder.svg"}
                        alt={currentCategory.category_name}
                        className="object-cover w-full h-full"
                      />
                  
                    </div>
                  )}
                  <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                    <div className="flex flex-col items-center space-y-2">
                      {editUploading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Uploading image...</div>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Upload a category image</div>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="edit-image-upload"
                            ref={editFileInputRef}
                            onChange={handleEditImageUpload}
                            disabled={editUploading}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent form submission
                              editFileInputRef.current?.click();
                            }}
                            disabled={editUploading}
                          >
                            Select Image
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => router.push("/admin/categories")}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}