"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-black text-zinc-400 text-xs mt-auto pt-16 pb-8 border-t border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-zinc-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-white text-lg font-black tracking-widest uppercase mb-4 block">
              ATHLETICA
            </Link>
            <p className="text-zinc-500 max-w-sm leading-relaxed mb-6">
              Engineered for runners, fitness enthusiasts, and champions. Discover our premium gear and redefine what is possible in athletic fashion and utility.
            </p>
            
            {/* Newsletter */}
            <div className="max-w-sm">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Join the Club & Get 10% Off</h4>
              <form onSubmit={handleSubscribe} className="relative flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 pr-12 text-zinc-200 placeholder-zinc-600 focus:border-white focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bg-white hover:bg-zinc-200 text-black px-3.5 py-1.5 rounded-md font-bold transition-all"
                  title="Subscribe to Newsletter"
                >
                  <Send size={12} />
                </button>
              </form>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-[#2563EB] mt-2 animate-pulse">
                  <CheckCircle2 size={13} />
                  <span>Subscribed! Check your inbox for your coupon code.</span>
                </div>
              )}
            </div>
          </div>

          {/* Shop categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Shop By Category</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products?gender=Men" className="hover:text-white transition-colors">Men's Apparel & Shoes</Link>
              </li>
              <li>
                <Link href="/products?gender=Women" className="hover:text-white transition-colors">Women's Apparel & Shoes</Link>
              </li>
              <li>
                <Link href="/products?gender=Kids" className="hover:text-white transition-colors">Kids' Collection</Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="hover:text-white transition-colors">Athletic Accessories</Link>
              </li>
            </ul>
          </div>

          {/* Shop sports */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Shop By Sport</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products?sport=Running" className="hover:text-white transition-colors">Running Gear</Link>
              </li>
              <li>
                <Link href="/products?sport=Training" className="hover:text-white transition-colors">Gym & Training</Link>
              </li>
              <li>
                <Link href="/products?sport=Football" className="hover:text-white transition-colors">Football / Soccer</Link>
              </li>
              <li>
                <Link href="/products?sport=Basketball" className="hover:text-white transition-colors">Basketball Apparel</Link>
              </li>
            </ul>
          </div>

          {/* Customer Help */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">Order Tracking</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">Shipping & Delivery</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">Returns & Refunds Policy</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">Contact Support</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-zinc-600">
            © {new Date().getFullYear()} Athletica Sportswear Inc. All Rights Reserved. Built with premium design standards.
          </div>
          
          {/* Payment providers simulated icons */}
          <div className="flex items-center gap-3 text-zinc-600 font-bold uppercase tracking-widest text-[9px]">
            <span>Razorpay</span>
            <span>UPI</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
