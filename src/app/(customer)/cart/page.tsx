"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import Loader from "@/components/Loader";
import { Trash2, ShieldCheck, Tag, Plus, Minus, ArrowRight, Heart } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    toggleSaveForLater,
    coupons,
    addToCart,
    cartLoading
  } = useApp();

  const router = useRouter();

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Split active items and saved for later items
  const activeItems = useMemo(() => cart.filter((item) => !item.savedForLater), [cart]);
  const savedItems = useMemo(() => cart.filter((item) => item.savedForLater), [cart]);

  // Pricing calculations
  const subtotal = useMemo(() => {
    return activeItems.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  }, [activeItems]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percentage") {
      return Math.round(subtotal * (appliedCoupon.value / 100));
    } else {
      return appliedCoupon.value;
    }
  }, [appliedCoupon, subtotal]);

  const taxAmount = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return Math.round(taxableAmount * 0.12); // Simulated 12% GST/Sales tax
  }, [subtotal, discountAmount]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponCode.trim()) return;

    const matched = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());

    if (!matched) {
      setCouponError("Invalid coupon code.");
      return;
    }

    if (subtotal < matched.minPurchase) {
      setCouponError(`Minimum purchase of ₹${matched.minPurchase} is required for this coupon.`);
      return;
    }

    setAppliedCoupon(matched);
    setCouponSuccess(`Coupon "${matched.code}" applied successfully!`);
    setCouponCode("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");
  };

  const handleQuantityChange = (productId: string, size: string, color: string, currentQty: number, offset: number) => {
    updateCartQty(productId, size, color, currentQty + offset);
  };

  const handleCheckoutRedirect = () => {
    if (appliedCoupon) {
      // Save applied coupon details temporarily to localStorage to consume during order placement
      localStorage.setItem("athletica_checkout_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("athletica_checkout_coupon");
    }
    router.push("/checkout");
  };

  if (cartLoading) return <Loader />;

  return (
    <div className="w-full bg-white text-black dark:bg-white dark:text-black min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111111] mb-8">
          Your Cart
        </h1>

        {activeItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Active Items Table (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">

              {activeItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex flex-col sm:flex-row gap-4 border border-zinc-100 p-4 rounded-2xl bg-white"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-zinc-50 rounded-xl overflow-hidden shrink-0 mx-auto sm:mx-0">
                    <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-black tracking-wider text-zinc-400 uppercase">{item.product.brand}</span>
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="text-sm font-bold hover:text-[#2563EB] line-clamp-1">{item.product.name}</h3>
                      </Link>

                      {/* Variant selections */}
                      <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-[11px] text-zinc-400 font-bold uppercase mt-1">
                        <span>Size: <span className="text-black">{item.selectedSize}</span></span>
                        <span>Color: <span className="text-black">{item.selectedColor}</span></span>
                      </div>
                    </div>

                    {/* Move/Remove buttons */}
                    <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
                      <button
                        onClick={() => toggleSaveForLater(item.product.id, item.selectedSize, item.selectedColor)}
                        className="text-[10px] font-bold text-zinc-400 hover:text-[#2563EB] uppercase flex items-center gap-1"
                      >
                        <Heart size={12} /> Save for later
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                        className="text-[10px] font-bold text-zinc-400 hover:text-red-600 uppercase flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Qty & Price selectors (extreme right) */}
                  <div className="flex sm:flex-col justify-between items-center sm:items-end shrink-0 border-t sm:border-t-0 border-zinc-100 pt-3 sm:pt-0">

                    {/* Quantity adjustment */}
                    <div className="flex items-center border border-zinc-200 rounded-lg py-1 px-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.selectedSize, item.selectedColor, item.quantity, -1)}
                        className="p-1 text-zinc-500 hover:text-black focus:outline-none"
                        title="Decrease Quantity"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#111111]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.selectedSize, item.selectedColor, item.quantity, 1)}
                        className="p-1 text-zinc-500 hover:text-black focus:outline-none"
                        title="Increase Quantity"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Multiplied Price */}
                    <div className="text-right mt-1 sm:mt-0">
                      <p className="text-sm font-black text-[#111111]">
                        ₹{item.product.sellingPrice * item.quantity}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-zinc-400">₹{item.product.sellingPrice} each</p>
                      )}
                    </div>

                  </div>

                </div>
              ))}

            </div>

            {/* Checkout pricing Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">

              {/* Price Cards Summary */}
              <div className="border border-zinc-100 rounded-2xl p-6 bg-zinc-50">
                <h3 className="font-black text-xs uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">Order Summary</h3>

                <div className="flex flex-col gap-3 font-semibold text-xs text-zinc-500">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="text-[#111111] font-extrabold">₹{subtotal}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> Discount ({appliedCoupon.code})
                      </span>
                      <span className="font-extrabold">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Tax (12%)</span>
                    <span className="text-[#111111] font-extrabold">₹{taxAmount}</span>
                  </div>

                  <hr className="border-zinc-200 my-1" />

                  <div className="flex justify-between text-sm text-[#111111] font-black uppercase">
                    <span>Total Amount</span>
                    <span className="text-[#2563EB]">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full bg-[#111111] hover:bg-[#2563EB] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  Proceed to Checkout
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Promo Code Application */}
              <div className="border border-zinc-100 rounded-2xl p-6 bg-white">
                <h4 className="font-black text-xs uppercase tracking-wider mb-3">Apply Promo Code</h4>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-xl">
                    <div className="text-xs">
                      <p className="font-bold text-green-700">Code "{appliedCoupon.code}" Active</p>
                      <p className="text-[10px] text-green-600">
                        {appliedCoupon.type === "percentage" ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`} applied.
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-zinc-400 hover:text-red-500 uppercase"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SPORT10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-[#111111] hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[10px] font-bold text-red-500 mt-2">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[10px] font-bold text-green-600 mt-2">{couponSuccess}</p>
                )}

                <div className="text-[10px] text-zinc-400 font-medium mt-3 leading-relaxed">
                  Try codes: <span className="font-bold text-[#111111]">SPORT10</span> (10% off &gt;₹50) or <span className="font-bold text-[#111111]">FIT20</span> (20% off &gt;₹100).
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-zinc-400 text-[10px] font-semibold uppercase">
                <ShieldCheck size={14} className="text-green-600" />
                <span>Secure Checkout SSL Guaranteed</span>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
            <p className="text-sm font-semibold text-zinc-500 mb-6">Your shopping cart is currently empty.</p>
            <Link
              href="/products"
              className="bg-black text-white hover:bg-[#2563EB] px-8 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Save For Later Section */}
        {savedItems.length > 0 && (
          <section className="mt-16 border-t border-zinc-100 pt-12">
            <h3 className="text-lg font-black uppercase text-[#111111] mb-6">Saved For Later</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-4 border border-zinc-100 p-4 rounded-2xl bg-white"
                >
                  <div className="w-16 h-16 bg-zinc-50 rounded-xl overflow-hidden shrink-0">
                    <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-xs line-clamp-1">{item.product.name}</h5>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                      <p className="text-xs font-black text-[#111111] mt-1">₹{item.product.sellingPrice}</p>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => toggleSaveForLater(item.product.id, item.selectedSize, item.selectedColor)}
                        className="text-[9px] font-black text-[#2563EB] hover:underline uppercase"
                      >
                        Move to bag
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                        className="text-[9px] font-black text-red-500 hover:underline uppercase"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
