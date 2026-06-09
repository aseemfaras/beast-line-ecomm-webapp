"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { Coupon } from "@/types/coupon";
import { Category, Subcategory } from "@/types/category";
import Loader from "@/components/Loader";
import { Plus, Trash2, Tag, ShieldCheck, Ticket, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";


export default function AdminCouponsPage() {
  const { coupons, createCoupon, deleteCoupon, couponsLoading } = useApp();

  // Create Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(50);
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Category/Subcategory state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [selectedBrandNames, setSelectedBrandNames] = useState<string[]>([]);

  useEffect(() => {
    api.get("/categories").then((data) => {
      setCategories(Array.isArray(data) ? data : []);
    }).catch(() => setCategories([]));
  }, []);

  // Fetch brands when subcategories are selected
  useEffect(() => {
    if (selectedSubcategoryIds.length === 0) {
      setAvailableBrands([]);
      return;
    }

    // Get category name + subcategory name pairs for selected subcategories
    const pairs: { category: string; subcategory: string }[] = [];
    for (const subId of selectedSubcategoryIds) {
      for (const cat of categories) {
        const sub = cat.subcategories.find((s) => s.id === subId);
        if (sub) {
          pairs.push({ category: cat.name, subcategory: sub.name });
          break;
        }
      }
    }

    // Fetch brands for each pair and combine
    Promise.all(
      pairs.map((p) =>
        api.get(`/products/brands?category=${encodeURIComponent(p.category)}&subcategory=${encodeURIComponent(p.subcategory)}`)
          .then((brands: string[]) => brands)
          .catch(() => [] as string[])
      )
    ).then((results) => {
      const allBrands = [...new Set(results.flat())].sort();
      setAvailableBrands(allBrands);
      // Remove brands that are no longer available
      setSelectedBrandNames((prev) => prev.filter((b) => allBrands.includes(b)));
    });
  }, [selectedSubcategoryIds, categories]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    // Remove subcategories belonging to deselected category
    setSelectedSubcategoryIds((prev) => {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return prev;
      const subIds = cat.subcategories.map((s) => s.id);
      return prev.filter((s) => !subIds.includes(s));
    });
  };

  const toggleSubcategory = (id: string) => {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrandNames((prev) =>
      prev.includes(brand) ? prev.filter((x) => x !== brand) : [...prev, brand]
    );
  };

  const openModal = () => {
    setCode("");
    setType("percentage");
    setValue(10);
    setMinPurchase(50);
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
    setSelectedBrandNames([]);
    setAvailableBrands([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() && value > 0) {
      const couponPayload: Coupon = {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minPurchase: Number(minPurchase),
        categoryIds: selectedCategoryIds,
        subcategoryIds: selectedSubcategoryIds,
        brandNames: selectedBrandNames,
      };
      
      createCoupon(couponPayload);
      toast.success(`Coupon "${couponPayload.code}" created successfully!`);
      closeModal();
    }
  };

  if (couponsLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">Promo Coupons Manager</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Control discounts codes, percentage multipliers, and checkout deduction guidelines</p>
        </div>
        <button
          onClick={openModal}
          className="bg-[#2563EB] hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold uppercase text-xs flex items-center gap-2"
        >
          <Plus size={14} /> Generate Coupon
        </button>
      </section>

      {/* Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-[520px] bg-white border border-gray-300 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 text-zinc-400 hover:text-black transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h3 className="font-black text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              <Ticket size={16} className="text-[#2563EB]" /> Generate Promo Code
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs text-left">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SPORT30"
                  className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 text-xs font-semibold text-black focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-xl bg-zinc-50 px-3 py-2 text-black focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 text-xs font-semibold text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Min Purchase Limit (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 text-xs font-semibold text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Applicable Categories (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-1.5 bg-zinc-50 border border-gray-300 rounded-xl px-3 py-1.5 cursor-pointer hover:border-blue-300 transition-all">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="accent-[#2563EB] w-3 h-3"
                      />
                      <span className="text-xs font-semibold text-black">{cat.name}</span>
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-zinc-400 italic text-[10px]">No categories available</p>
                  )}
                </div>
              </div>

              {selectedCategoryIds.length > 0 && (() => {
                const availableSubs = categories
                  .filter((c) => selectedCategoryIds.includes(c.id))
                  .flatMap((c) => c.subcategories.map((s) => ({ ...s, categoryName: c.name })));
                if (availableSubs.length === 0) return null;
                return (
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Applicable Subcategories (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSubs.map((sub) => (
                        <label key={sub.id} className="flex items-center gap-1.5 bg-zinc-50 border border-gray-300 rounded-xl px-3 py-1.5 cursor-pointer hover:border-blue-300 transition-all">
                          <input
                            type="checkbox"
                            checked={selectedSubcategoryIds.includes(sub.id)}
                            onChange={() => toggleSubcategory(sub.id)}
                            className="accent-[#2563EB] w-3 h-3"
                          />
                          <span className="text-xs font-semibold text-black">{sub.name}</span>
                          <span className="text-[9px] text-zinc-400">({sub.categoryName})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {availableBrands.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Applicable Brands (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-1.5 bg-zinc-50 border border-gray-300 rounded-xl px-3 py-1.5 cursor-pointer hover:border-blue-300 transition-all">
                        <input
                          type="checkbox"
                          checked={selectedBrandNames.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="accent-[#2563EB] w-3 h-3"
                        />
                        <span className="text-xs font-semibold text-black">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl font-bold uppercase text-xs mt-2"
              >
                Add Coupon
              </button>
            </form>
          </div>
        </div>
      )}

        {/* Coupon list table */}
        <div className="bg-white border border-gray-300 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto text-xs text-left">
            {coupons.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="p-4">Code</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Value</th>
                    <th className="p-4">Min Spend</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.code} className="border-b border-gray-100 last:border-none hover:bg-zinc-50/50">
                      <td className="p-4 font-mono font-bold text-black flex items-center gap-1.5 uppercase">
                        <Tag size={13} className="text-[#2563EB]" /> {c.code}
                      </td>
                      <td className="p-4 font-bold text-zinc-500 uppercase text-[9px]">{c.type}</td>
                      <td className="p-4 font-black">
                        {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td className="p-4 font-extrabold text-zinc-500">₹{c.minPurchase} Min</td>
                      <td className="p-4 font-semibold text-zinc-500 text-[10px]">
                        {(() => {
                          const catIds = c.categoryIds ?? [];
                          const subIds = c.subcategoryIds ?? [];
                          const brands = c.brandNames ?? [];
                          if (catIds.length === 0 && subIds.length === 0 && brands.length === 0) {
                            return <span className="text-zinc-400">All</span>;
                          }
                          const tags: React.ReactNode[] = [];
                          for (const catId of catIds) {
                            const cat = categories.find((ct) => ct.id === catId);
                            if (cat) {
                              const catSubIds = cat.subcategories.map((s) => s.id);
                              const allSubsSelected = catSubIds.length > 0 && catSubIds.every((sid) => subIds.includes(sid));
                              tags.push(
                                <span key={catId} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg inline-block mr-1 mb-1">
                                  {cat.name}{allSubsSelected ? " (all)" : ""}
                                </span>
                              );
                            }
                          }
                          for (const subId of subIds) {
                            for (const cat of categories) {
                              const sub = cat.subcategories.find((s) => s.id === subId);
                              if (sub && !catIds.includes(cat.id)) {
                                tags.push(
                                  <span key={subId} className="bg-purple-50 text-purple-600 px-2 py-1 rounded-lg inline-block mr-1 mb-1">
                                    {cat.name} / {sub.name}
                                  </span>
                                );
                              } else if (sub && catIds.includes(cat.id)) {
                                tags.push(
                                  <span key={subId} className="bg-purple-50 text-purple-600 px-2 py-1 rounded-lg inline-block mr-1 mb-1">
                                    {sub.name}
                                  </span>
                                );
                              }
                            }
                          }
                          for (const brand of brands) {
                            tags.push(
                              <span key={brand} className="bg-green-50 text-green-600 px-2 py-1 rounded-lg inline-block mr-1 mb-1">
                                {brand}
                              </span>
                            );
                          }
                          return <div className="flex flex-wrap">{tags}</div>;
                        })()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => deleteCoupon(c.code)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-200 transition-all"
                          title="Delete Coupon"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="italic text-zinc-400 p-6 text-center">No coupon codes active.</p>
            )}
          </div>
        </div>

    </div>
  );
}
