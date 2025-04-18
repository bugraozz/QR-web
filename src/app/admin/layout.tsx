"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Tag, QrCode, Settings, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const routes = [
    {
      icon: LayoutDashboard,
      href: "/admin",
      label: "Dashboard",
      active: pathname === "/admin",
    },
    {
      icon: Package,
      href: "/admin/products",
      label: "Products",
      active: pathname === "/admin/products",
    },
    {
      icon: Tag,
      href: "/admin/categories",
      label: "Categories",
      active: pathname === "/admin/categories",
    },
    {
      icon: QrCode,
      href: "/admin/qr-codes",
      label: "QR Codes",
      active: pathname === "/admin/qr-codes",
    },
    {
      icon: Settings,
      href: "/admin/settings",
      label: "Settings",
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navbar for mobile */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:hidden">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="font-semibold">Admin Dashboard</div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center border-b px-6 font-semibold lg:h-[61px]">Admin Dashboard</div>
          <nav className="flex-1 overflow-auto py-4">
            <ul className="grid gap-1 px-2">
              {routes.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Back to Site</Link>
            </Button>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

