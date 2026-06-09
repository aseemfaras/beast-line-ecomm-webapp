"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import ProductCard from "../../../components/ProductCard";
import Loader from "@/components/Loader";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, products, wishlistLoading, productsLoading } = useApp();

  // Find products matching wishlist IDs
  const wishlistedProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [wishlist, products]);

  if (wishlistLoading || productsLoading) return <Loader />;

  return (
    <div className="w-full bg-white text-black dark:bg-white dark:text-black min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111111] mb-8 flex items-center gap-2">
          <Heart className="fill-red-500 text-red-500" size={24} /> My Wishlist
        </h1>

        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {wishlistedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-500 mb-6">Your wishlist is currently empty.</p>
            <Link
              href="/products"
              className="bg-black text-white hover:bg-[#2563EB] px-8 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
            >
              Explore Performance Gear
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
