"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, RefreshCw, Zap, Headphones } from "lucide-react";

export default function HomePage() {
  const { products, banners, productsLoading, bannersLoading } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate hero slides
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (productsLoading || bannersLoading) return <Loader />;

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  // Filter products for sections
  const featuredProds = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);
  const trendingProds = products.filter((p) => p.trending).slice(0, 4);
  const newArrivals = products.slice(0, 4);

  const categories = [
    { name: "Men", img: "https://images.unsplash.com/photo-1542319281-2a3772c20dfc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", link: "/products?category=Men" },
    { name: "Women", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&auto=format&fit=crop&q=90", link: "/products?category=Women" },
  ];

  const sports = [
    { name: "Running", img: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=400&auto=format&fit=crop&q=80", link: "/products?sport=Running" },
    { name: "Training", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80", link: "/products?sport=Training" },
    { name: "Football", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80", link: "/products?sport=Football" },
    { name: "Basketball", img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80", link: "/products?sport=Basketball" },
    { name: "Cricket", img: "https://images.unsplash.com/photo-1531415080290-bc9b131027d7?w=400&auto=format&fit=crop&q=80", link: "/products?sport=Cricket" },
    { name: "Gym", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80", link: "/products?sport=Gym" },
  ];

  return (
    <>
      <div className="flex flex-col w-full bg-white pb-16 text-black">

        {/* 1. Hero Banner Slideshow */}
        <section className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden bg-zinc-950">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
            >
              {/* Background Image overlay */}
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src={banner.image.startsWith("http") ? banner.image : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${banner.image}`}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Hero Content */}
              <div className="absolute inset-0 flex flex-col justify-center items-start px-6 sm:px-12 lg:px-24 z-20 text-white max-w-4xl">
                <span className="text-xs md:text-sm font-bold tracking-widest bg-[#2563EB] px-3.5 py-1 rounded-full uppercase mb-4 animate-fade-in">
                  New Collection
                </span>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight uppercase mb-4">
                  {banner.title}
                </h1>
                <p className="text-sm sm:text-lg text-zinc-200 mb-8 max-w-xl font-medium leading-relaxed">
                  {banner.subtitle}
                </p>
                <Link
                  href={banner.link || "/products"}
                  className="bg-white hover:bg-[#2563EB] hover:text-white text-[#111111] px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-lg"
                >
                  Shop Collection
                </Link>
              </div>
            </div>
          ))}

          {/* Carousel controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all border border-white/20 active:scale-95"
                title="Previous Slide"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-full transition-all border border-white/20 active:scale-95"
                title="Next Slide"
              >
                <ArrowRight size={16} />
              </button>

              {/* Slide Indicator Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? "bg-[#2563EB] w-8" : "bg-white/40 hover:bg-white"
                      }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>



        {/* 3. Shop By Category Grid */}
        <section className="w-full pt-16">
          <div className="mx-auto flex max-w-7xl items-end justify-between px-4 sm:px-6 lg:px-8 mb-8">
            <div>
              {/* <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB]">Targeted gear</span> */}
              <h2 className="text-xl font-black uppercase text-black">Shop By Category</h2>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 md:grid-cols-2">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.link}
                className="group relative h-[360px] overflow-hidden bg-zinc-900 md:h-[520px]"
              >
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-300 z-10" />
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-8 px-8 z-20 flex justify-between items-center text-white md:bottom-10 md:px-12">
                  <span className="font-black text-2xl md:text-4xl uppercase tracking-wider">{cat.name}</span>
                  <span className="bg-white text-black p-3 rounded-full transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shadow">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>



        {/* 5. Shop By Sport Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase text-black dark:text-black">Shop By Sport</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sports.map((sport) => (
              <Link
                key={sport.name}
                href={sport.link}
                className="group relative h-40 md:h-48 rounded-xl overflow-hidden bg-zinc-900"
              >
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-300 z-10" />
                <img
                  src={sport.img}
                  alt={sport.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center z-20 text-white p-2">
                  <span className="font-extrabold text-sm md:text-base uppercase tracking-wider text-center">{sport.name}</span>
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Service Benefits */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-15 text-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="text-black" strokeWidth={1.5} />
              <h5 className="font-black text-sm uppercase text-black tracking-wide">Easy Returns</h5>
              <p className="text-xs text-zinc-500 max-w-[220px]">Hassle-free returns for a smooth, worry-free shopping experience.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Truck size={32} className="text-black" strokeWidth={1.5} />
              <h5 className="font-black text-sm uppercase text-black tracking-wide">24 HRS Shipping</h5>
              <p className="text-xs text-zinc-500 max-w-[220px]">Fast dispatch within 24 hours so your order reaches you sooner.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Headphones size={32} className="text-black" strokeWidth={1.5} />
              <h5 className="font-black text-sm uppercase text-black tracking-wide">Priority Support</h5>
              <p className="text-xs text-zinc-500 max-w-[220px]">Dedicated priority support whenever you need assistance.</p>
            </div>
          </div>
        </section>



        {/* 7. New Arrivals & Trending Columns */}
        {/* <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
          <div>
            <div className="flex items-end justify-between mb-6">
              <h3 className="text-xl font-black uppercase text-[#111111] dark:text-white">New Arrivals</h3>
              <Link href="/products" className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white uppercase">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {newArrivals.slice(0, 2).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>

          
          <div>
            <div className="flex items-end justify-between mb-6">
              <h3 className="text-xl font-black uppercase text-[#111111] dark:text-white">Trending Now</h3>
              <Link href="/products" className="text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white uppercase">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {trendingProds.slice(0, 2).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section> */}
      </div>

      {/* 2. Values Proposition Bar */}
      {/* <section className="bg-black  py-8 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 bg-blue-50 text-white rounded-full dark:bg-zinc-800">
              <Truck size={18} />
            </div>
            <h5 className="font-bold text-xs uppercase text-[#111111] dark:text-zinc-200">Free Fast Delivery</h5>
            <p className="text-[10px] text-zinc-500">On all sportswear orders over $50</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 bg-blue-50 text-white rounded-full dark:bg-zinc-800">
              <RefreshCw size={18} />
            </div>
            <h5 className="font-bold text-xs uppercase text-[#111111] dark:text-zinc-200">30-Day Free Returns</h5>
            <p className="text-[10px] text-zinc-500">Return or exchange sizes hassle-free</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 bg-blue-50 text-white rounded-full dark:bg-zinc-800">
              <ShieldCheck size={18} />
            </div>
            <h5 className="font-bold text-xs uppercase text-[#111111] dark:text-zinc-200">100% Genuine Gear</h5>
            <p className="text-[10px] text-zinc-500">Sourced directly from verified brands</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 bg-blue-50 text-white rounded-full dark:bg-zinc-800">
              <Zap size={18} />
            </div>
            <h5 className="font-bold text-xs uppercase text-[#111111] dark:text-zinc-200">Express Checkout</h5>
            <p className="text-[10px] text-zinc-500">UPI, Credit Card, Razorpay supported</p>
          </div>
        </div>
      </section> */}
    </>

  );
}
