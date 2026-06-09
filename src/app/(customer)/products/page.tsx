"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { Product } from "@/types/product";
import { Category as FilterCategory, Subcategory as FilterSubcategory } from "@/types/category";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import api from "@/utils/api";


function ProductsContent() {
  const { products, productsLoading } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL Filters
  const urlGender = searchParams.get("gender");
  const urlCategory = searchParams.get("category");
  const urlSubCategory = searchParams.get("subCategory");
  const urlSport = searchParams.get("sport");
  const urlSearch = searchParams.get("search");

  // State Filters
  const [selectedGender, setSelectedGender] = useState<string[]>(urlGender ? [urlGender] : []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string[]>(urlSubCategory ? [urlSubCategory] : []);
  const [selectedSport, setSelectedSport] = useState<string[]>(urlSport ? [urlSport] : []);
  const [priceRange, setPriceRange] = useState<number>(300);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [categoriesData, setCategoriesData] = useState<FilterCategory[]>([]);
  const [openFilters, setOpenFilters] = useState({
    gender: false,
    category: false,
    size: false,
    color: false,
    price: false,
    brand: false,
    sport: false,
    rating: false,
    stock: false,
  });

  const toggleFilterSection = (key: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Sync initial URL changes
  React.useEffect(() => {
    const g = searchParams.get("gender");
    setSelectedGender(g ? [g] : []);
    setSelectedCategory(searchParams.get("category"));
    const sc = searchParams.get("subCategory");
    setSelectedSubCategory(sc ? [sc] : []);
    const sp = searchParams.get("sport");
    setSelectedSport(sp ? [sp] : []);
  }, [searchParams]);

  // Fetch categories from backend for filter options
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get("/categories");
        setCategoriesData(Array.isArray(data) ? data : []);
      } catch {
        setCategoriesData([]);
      }
    };
    loadCategories();
  }, []);

  // Dynamic gender options based on selected category
  const availableGenders = useMemo(() => {
    const all = ["Men", "Women", "Kids", "Unisex"];
    if (!selectedCategory) return all;
    const match = selectedCategory.toLowerCase();
    if (match === "men") return ["Men", "Unisex"];
    if (match === "women") return ["Women", "Unisex"];
    if (match === "kids") return ["Kids", "Unisex"];
    return all;
  }, [selectedCategory]);

  // Dynamic subcategories from backend based on selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [] as FilterSubcategory[];
    const matched = categoriesData.find(
      (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
    return matched?.subcategories ?? [];
  }, [selectedCategory, categoriesData]);

  // Available Filter Options gathered from actual products
  const filterOptions = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const brands = new Set<string>();
    
    products.forEach((p) => {
      p.sizes.forEach((s) => sizes.add(s));
      p.colors.forEach((c) => colors.add(c));
      brands.add(p.brand);
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      brands: Array.from(brands).sort(),
    };
  }, [products]);

  // Size/Color/Brand toggles
  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedGender([]);
    setSelectedCategory(null);
    setSelectedSubCategory([]);
    setSelectedSport([]);
    setPriceRange(300);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setSelectedRating(null);
    setOnlyAvailable(false);
    router.push("/products"); // Reset search query in URL
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query match
    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    // Gender filter
    if (selectedGender.length > 0) {
      result = result.filter(
        (p) => selectedGender.some((g) => p.gender.toLowerCase() === g.toLowerCase()) || p.gender === "Unisex"
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // SubCategory filter
    if (selectedSubCategory.length > 0) {
      result = result.filter(
        (p) => selectedSubCategory.some((sc) => p.subCategory.toLowerCase() === sc.toLowerCase())
      );
    }

    // Sport filter
    if (selectedSport.length > 0) {
      result = result.filter(
        (p) => selectedSport.some((sp) => p.sportType.toLowerCase() === sp.toLowerCase())
      );
    }

    // Price filter
    result = result.filter((p) => p.sellingPrice <= priceRange);

    // Sizes filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }

    // Colors filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c))
      );
    }

    // Brands filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Rating filter
    if (selectedRating) {
      result = result.filter((p) => p.rating >= selectedRating);
    }

    // Availability
    if (onlyAvailable) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case "popular":
        result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "latest":
      default:
        // Mock latest sorting by reverse ID creation order
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [
    products,
    urlSearch,
    selectedGender,
    selectedCategory,
    selectedSubCategory,
    selectedSport,
    priceRange,
    selectedSizes,
    selectedColors,
    selectedBrands,
    selectedRating,
    onlyAvailable,
    sortBy,
  ]);

  // Page title from category/subcategory
  const pageTitle = useMemo(() => {
    const parts: string[] = [];
    if (selectedCategory) parts.push(selectedCategory.toUpperCase() + "'S");
    if (selectedSubCategory.length > 0) parts.push(selectedSubCategory[0].toUpperCase());
    if (parts.length === 0 && urlSearch) return `SEARCH: "${urlSearch}"`;
    return parts.join(" ") || "ALL PRODUCTS";
  }, [selectedCategory, selectedSubCategory, urlSearch]);

  const sortLabels: Record<string, string> = {
    "latest": "New Arrivals",
    "price-asc": "Price Low To High",
    "price-desc": "Price High To Low",
    "popular": "Top Sellers",
    "rating": "Recommended",
  };

  if (productsLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-7xl bg-white px-4 py-10 text-black sm:px-6 lg:px-8">
      
      {/* Search Header Banner */}
      {urlSearch && (
        <div className="mb-6 bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex justify-between items-center">
          <p className="text-sm font-medium">
            Showing results for query: <span className="font-bold text-[#2563EB]">"{urlSearch}"</span>
          </p>
          <button 
            onClick={() => router.push("/products")} 
            className="flex items-center gap-1 text-xs font-bold uppercase text-zinc-500 hover:text-black"
          >
            Clear Search <X size={12} />
          </button>
        </div>
      )}

      {/* PAGE TITLE */}
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-4">
        {pageTitle}
      </h1>

      {/* CONTROLS ROW: FILTERS button + Sort Dropdown */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 border border-zinc-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black"
          >
            {sortLabels[sortBy] || "Sort By"}
            <ChevronDown size={14} className={`transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {sortDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-200 shadow-xl z-40">
              <p className="px-4 py-2 text-[10px] font-bold uppercase text-zinc-400">Sort by</p>
              {Object.entries(sortLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setSortDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                    sortBy === key ? "bg-[#2563EB] text-white" : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT COUNT */}
      <p className="text-xs font-bold uppercase tracking-wider text-black mb-6">
        {filteredProducts.length} Products
      </p>

      {/* MAIN PRODUCT GRID */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <p className="text-sm font-semibold text-zinc-500 mb-4">No products match your active filters.</p>
          <button
            onClick={clearAllFilters}
            className="bg-[#111111] text-white hover:bg-zinc-800 px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* FILTER DRAWER (Overlay Modal) */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)}>
          <div
            className="w-96 max-w-[90vw] h-full bg-white flex flex-col overflow-hidden shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 shrink-0 bg-zinc-50">
              <h3 className="font-bold text-base text-black">Product Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Filter Sections */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              {/* Gender */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("gender")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Gender
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.gender ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.gender ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="flex flex-col gap-2 pt-3">
                      {availableGenders.map((gender) => (
                        <label key={gender} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input type="checkbox" checked={selectedGender.includes(gender)} onChange={() => setSelectedGender((prev) => prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender])} className="h-4.5 w-4.5 border-zinc-300 text-black accent-black focus:ring-black" />
                          <span>{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Type (Subcategories from backend) */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("category")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Product Type
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.category ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.category ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="flex flex-col gap-2 pt-3">
                      {availableSubcategories.length > 0 ? (
                        availableSubcategories.map((sub) => (
                          <label key={sub.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                            <input type="checkbox" checked={selectedSubCategory.includes(sub.name)} onChange={() => setSelectedSubCategory((prev) => prev.includes(sub.name) ? prev.filter((s) => s !== sub.name) : [...prev, sub.name])} className="h-4.5 w-4.5 border-zinc-300 text-black accent-black focus:ring-black" />
                            <span>{sub.name}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-[10px] text-zinc-400 italic">Select a category to see subcategories</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("price")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Price
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.price ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.price ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="pt-3">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span>Max Price</span>
                        <span>${priceRange}</span>
                      </div>
                      <input type="range" min="10" max="300" step="5" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("size")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Size
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.size ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.size ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="grid grid-cols-4 gap-2 pt-3">
                      {filterOptions.sizes.map((sz) => (
                        <button key={sz} onClick={() => handleSizeToggle(sz)} className={`h-8 border text-[10px] font-bold transition-all ${selectedSizes.includes(sz) ? "bg-[#111111] text-white border-black" : "border-zinc-200 text-zinc-700 hover:border-black"}`}>
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colour */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("color")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Colour
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.color ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.color ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="grid grid-cols-4 gap-2 pt-3">
                      {filterOptions.colors.map((c) => (
                        <button key={c} onClick={() => handleColorToggle(c)} className={`h-8 border text-[10px] font-bold transition-all ${selectedColors.includes(c) ? "bg-[#2563EB] text-white border-[#2563EB]" : "border-zinc-200 text-zinc-700 hover:border-black"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("brand")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Brand
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.brand ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.brand ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="flex flex-col gap-2 pt-3">
                      {filterOptions.brands.map((b) => (
                        <label key={b} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => handleBrandToggle(b)} className="h-4.5 w-4.5 border-zinc-300 text-black accent-black focus:ring-black" />
                          <span>{b}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sport Type */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("sport")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Sport Type
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.sport ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.sport ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="flex flex-col gap-2 pt-3">
                      {["Running", "Training", "Football", "Basketball", "Gym"].map((sport) => (
                        <label key={sport} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input type="checkbox" checked={selectedSport.includes(sport)} onChange={() => setSelectedSport((prev) => prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport])} className="h-4.5 w-4.5 border-zinc-300 text-black accent-black focus:ring-black" />
                          <span>{sport}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="border-b border-zinc-100 py-4">
                <button type="button" onClick={() => toggleFilterSection("rating")} className="flex w-full items-center justify-between text-sm font-semibold text-zinc-700 hover:text-black transition-colors py-1">
                  Rating
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFilters.rating ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFilters.rating ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden min-h-0">
                    <div className="flex flex-col gap-2 pt-3">
                      {[4.5, 4.0, 3.5].map((stars) => (
                        <label key={stars} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input type="radio" name="min-rating" checked={selectedRating === stars} onChange={() => setSelectedRating(stars)} className="h-4.5 w-4.5 border-zinc-300 text-black accent-black focus:ring-black" />
                          <span>{stars}+ Stars</span>
                        </label>
                      ))}
                      {selectedRating && (
                        <button onClick={() => setSelectedRating(null)} className="text-[10px] font-bold text-[#2563EB] text-left hover:underline">Clear Rating</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="shrink-0 px-6 py-5 border-t border-zinc-200 bg-zinc-50">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-[#111111] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors rounded-lg"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2563EB] border-t-transparent" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
