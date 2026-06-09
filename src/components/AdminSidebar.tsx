"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ScrollText, 
  Boxes, 
  Users, 
  Ticket, 
  Image as ImageIcon, 
  MessageSquareHeart, 
  RotateCcw,
  Store,
  FolderTree,
  Tag
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Category Management", path: "/admin/categories", icon: FolderTree },
    { name: "Products Management", path: "/admin/products", icon: ShoppingBag },
    { name: "Order Management", path: "/admin/orders", icon: ScrollText },
    { name: "Inventory Control", path: "/admin/inventory", icon: Boxes },
    { name: "User Management", path: "/admin/users", icon: Users },
    { name: "Promo Coupons", path: "/admin/coupons", icon: Ticket },
    { name: "Hero Banners", path: "/admin/banners", icon: ImageIcon },
    { name: "Product Reviews", path: "/admin/reviews", icon: MessageSquareHeart },
    { name: "Return Requests", path: "/admin/returns", icon: RotateCcw }
  ];

  return (
    <aside className="w-64 bg-white text-black shrink-0 h-screen sticky top-0 flex flex-col justify-between border-r border-zinc-200 overflow-hidden">
      
      <div className="flex flex-col gap-8 flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
        {/* Brand Header */}
        <div>
          <Link href="/admin" className="text-black text-base font-black tracking-widest uppercase flex items-center gap-2">
            ATHLETICA <span className="bg-black text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-normal">Admin</span>
          </Link>
          <p className="text-[10px] text-black font-semibold uppercase mt-1">Management Portal</p>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if active: exact match or prefixes for sub-pages
            const active = pathname === item.path;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl transition-all ${
                  active
                    ? "bg-zinc-100 text-black border-l-4 border-black"
                    : "hover:bg-zinc-100 hover:text-black"
                }`}
              >
                <Icon size={16} className={active ? "text-black" : ""} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch back to Customer Portal */}
      <div className="border-t border-zinc-200 pt-6 px-6 pb-6 shrink-0">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-black hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
        >
          <Store size={14} />
          Return to Store
        </Link>
      </div>

    </aside>
  );
}
