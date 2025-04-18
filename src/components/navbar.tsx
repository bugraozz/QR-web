"use client";

import React, { useEffect, useState } from "react";
import { Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";

interface Category {
  id: number;
  Category_name: string;
  slug: string;
}

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
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

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            setActive={setActive}
            active={active}
            item={category.Category_name}
          >
            <div className="flex flex-col space-y-4 text-sm">
              <Link href={`/category/${category.slug}`}>
                {category.Category_name}
              </Link>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
