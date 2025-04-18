"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus, Filter, Search, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import axios from "axios";
import { checkAuth } from "@/lib/auth";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    stock: number;
    status: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState('');
    const [İsDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
    const router = useRouter()

    const fetchProducts = async () => {
        try {
            const response = await axios.get<Product[]>('/api/admin/products');
            const formattedProducts = response.data.map((product) => ({
                ...product,
                price: parseFloat(product.price as unknown as string), // Ensure price is a number
                category: product.category || "Unknown", // Ensure category is displayed
            }));
            setProducts(formattedProducts);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to fetch products');
        }
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        );
    };

    const handlePriceChange = (type: "min" | "max", value: string) => {
        setPriceRange((prev) => ({
            ...prev,
            [type]: value ? parseFloat(value) : null,
        }));
    };

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const matchesStatus =
            selectedStatuses.length === 0 || selectedStatuses.includes(product.status);
        const matchesPrice =
            (priceRange.min === null || product.price >= priceRange.min) &&
            (priceRange.max === null || product.price <= priceRange.max);

        return matchesCategory && matchesStatus && matchesPrice;
    });

    useEffect(() => {
        checkAuth(router.push, setIsAuthenticated);
        fetchProducts();
    }, [router]);

    if (!isAuthenticated) {
        return null; // Render nothing while checking authentication
    }

    const deleteProduct = async (id: number) => {
        try {
            await axios.delete(`/api/admin/products`, {
                params: { id }, // Pass the product ID as a query parameter
            });

            setProducts(products.filter((product) => product.id !== id));
            fetchProducts(); // Refresh the product list
        } catch (err) {
            console.error("Failed to delete product:", err);
            setError("Failed to delete product");
        }
    };

    const openDeleteDialog = (product: Product) => {
        setCurrentProduct(product); 
        setIsDeleteDialogOpen(true); 
    };

    const uniqueCategories = Array.from(new Set(products.map(product => product.category)));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
                <Card className="w-full md:w-64 lg:w-72">
                   
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="font-medium">Categories</div>
                            <div className="space-y-1">
                                {uniqueCategories.map((category) => (
                                    <div className="flex items-center space-x-2" key={category}>
                                        <input
                                            type="checkbox"
                                            id={category}
                                            className="h-4 w-4 rounded border-gray-300"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => handleCategoryChange(category)}
                                        />
                                        <label htmlFor={category} className="text-sm">
                                            {category}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="font-medium">Status</div>
                            <div className="space-y-1">
                                {["In Stock", "Out of Stock"].map((status) => (
                                    <div className="flex items-center space-x-2" key={status}>
                                        <input
                                            type="checkbox"
                                            id={status}
                                            className="h-4 w-4 rounded border-gray-300"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() => handleStatusChange(status)}
                                        />
                                        <label htmlFor={status} className="text-sm">
                                            {status}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="font-medium">Price Range</div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="h-8"
                                    value={priceRange.min || ""}
                                    onChange={(e) => handlePriceChange("min", e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="h-8"
                                    value={priceRange.max || ""}
                                    onChange={(e) => handlePriceChange("max", e.target.value)}
                                />
                            </div>
                        </div>
                      
                    </CardContent>
                </Card>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <ArrowUpDown className="h-4 w-4" />
                            <span className="sr-only">Sort</span>
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                            
                                            <TableCell>
                                                <Badge
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
                                            </TableCell>
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
                                                            <Link href={`/admin/products/${product.id}`}>Edit</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => openDeleteDialog(product)} // Open the dialog with the selected product
                                                        >
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
            <Dialog open={İsDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this product?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        {currentProduct && (
                            <Button
                                className="text-destructive"
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    deleteProduct(currentProduct.id); // Delete the selected product
                                }}
                            >
                                Delete
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}