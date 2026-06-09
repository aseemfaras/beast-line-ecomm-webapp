"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "../app/context/AppContext";
import { Product, ProductCardProps } from "@/types/product";
import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";


export default function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart, cart } = useApp();

  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.some(item => item.product.id === product.id && !item.savedForLater);
  const displayColors = product.colors.slice(0, 2);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(isWishlisted ? "Removed from wishlist." : "Added to wishlist.");
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Choose first color/size as default for quick addition
    const defaultColor = product.colors[0] || "Default";
    const defaultSize = product.sizes[0] || "M";
    addToCart(product, defaultSize, defaultColor, 1);
    toast.success("Added to cart.");
  };

  return (
    <div className="group relative flex flex-col bg-white">
      
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#d1d1d1]">
        <Link href={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 active:scale-95"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            size={22}
            strokeWidth={1.8}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-black"}
          />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-all duration-300 group-hover:translate-y-0 bg-gradient-to-t from-black/50 to-transparent flex justify-end">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="flex items-center justify-center gap-1.5 bg-white text-[#111111] hover:bg-[#2563EB] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-300"
            title="Quick Add to Cart"
          >
            <ShoppingCart size={14} />
            {product.stock === 0 ? "Out of Stock" : isInCart ? "Add Another" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Product Info Area */}
      <div className="flex flex-1 flex-col bg-white pt-6 text-black">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="mb-1 text-base font-bold leading-tight text-black transition-colors hover:text-[#2563EB]">
            {product.name}
          </h3>
        </Link>
        
        <p className="mb-2 text-base leading-tight text-zinc-500">
          {product.shortDescription}
        </p>

        <div className="mb-4 flex items-center gap-2">
          {displayColors.map((color) => (
            <span
              key={color}
              className="h-5 w-5 rounded-full border border-black/10"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Pricing block */}
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold leading-none text-black">
            ₹{product.sellingPrice.toLocaleString("en-IN")}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-base text-zinc-400 line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
      
    </div>
  );
}
