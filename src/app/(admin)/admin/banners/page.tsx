"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { Category, Subcategory } from "@/types/category";
import Loader from "@/components/Loader";
import { Plus, Trash2, Image as ImageIcon, Check } from "lucide-react";
import api from "@/utils/api";


const CAMPAIGN_TYPES = ["hero", "category", "offer"] as const;

export default function AdminBannersPage() {
  const { banners, createBanner, deleteBanner, bannersLoading } = useApp();

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [success, setSuccess] = useState(false);

  // Multi-select state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);

  useEffect(() => {
    api.get("/categories").then((data) => {
      setCategories(Array.isArray(data) ? data : []);
    }).catch(() => setCategories([]));
  }, []);

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && imageFile) {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("image", imageFile);
      formData.append("type", JSON.stringify(selectedTypes));
      formData.append("categoryIds", JSON.stringify(selectedCategoryIds));
      formData.append("subcategoryIds", JSON.stringify(selectedSubcategoryIds));

      createBanner(formData);

      // Reset form
      setTitle("");
      setSubtitle("");
      setImageFile(null);
      setImagePreview("");
      setSelectedTypes([]);
      setSelectedCategoryIds([]);
      setSelectedSubcategoryIds([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // Build image URL for display (handles both /uploads/ paths and full URLs)
  const getImageUrl = (img: string) => {
    if (img.startsWith("http")) return img;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${base}${img}`;
  };

  if (bannersLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">Hero Banners Manager</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Control homepage sliders, campaign layouts, and advertisement links</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Create Banner Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-300 rounded-3xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
            <ImageIcon size={16} className="text-[#2563EB]" /> Generate Slide Campaign
          </h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs text-left">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Banner Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SUMMER APPAREL SALE"
                className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 text-xs font-semibold text-black focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Subtitle / Campaign Pitch</label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Enjoy up to 30% discount on summer sportswear apparel."
                className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 text-xs font-semibold text-black focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Banner Image</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl bg-zinc-50 px-4 py-3 cursor-pointer hover:border-blue-300 transition-all">
                  <ImageIcon size={14} className="text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-500">
                    {imageFile ? imageFile.name : "Choose image file"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    required
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-300 shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Campaign Type</label>
              <div className="flex flex-wrap gap-2">
                {CAMPAIGN_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-1.5 bg-zinc-50 border border-gray-300 rounded-xl px-3 py-1.5 cursor-pointer hover:border-blue-300 transition-all">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(t)}
                      onChange={() => toggleType(t)}
                      className="accent-[#2563EB] w-3 h-3"
                    />
                    <span className="text-xs font-semibold text-black uppercase">{t}</span>
                  </label>
                ))}
              </div>
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

            <button
              type="submit"
              className="bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-xl font-bold uppercase text-xs mt-2"
            >
              Add Campaign Banner
            </button>
          </form>

          {success && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-green-600 font-semibold text-[10px] uppercase mt-4">
              Banner campaign added!
            </div>
          )}
        </div>

        {/* Banner list layout (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {banners.length > 0 ? (
            banners.map((b) => (
              <div 
                key={b.id} 
                className="border border-gray-300 rounded-3xl overflow-hidden bg-white flex flex-col sm:flex-row gap-4 p-4 text-xs text-left"
              >
                {/* Image preview */}
                <div className="w-full sm:w-28 h-20 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                  <img src={getImageUrl(b.image)} className="w-full h-full object-cover" alt="" />
                </div>
                
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {(b.type ?? []).map((t) => (
                        <span key={t} className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/20">{t}</span>
                      ))}
                      {(!b.type || b.type.length === 0) && (
                        <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-zinc-100 text-zinc-400">none</span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-sm text-black line-clamp-1">{b.title}</h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{b.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(b.categoryIds ?? []).map((catId) => {
                      const cat = categories.find((c) => c.id === catId);
                      return cat ? (
                        <span key={catId} className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{cat.name}</span>
                      ) : null;
                    })}
                    {(b.subcategoryIds ?? []).map((subId) => {
                      for (const cat of categories) {
                        const sub = cat.subcategories.find((s) => s.id === subId);
                        if (sub) return (
                          <span key={subId} className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">{sub.name}</span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Delete button */}
                <div className="shrink-0 flex items-center justify-end">
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 border border-gray-300 rounded-xl hover:border-red-200 transition-all"
                    title="Delete Campaign"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="italic text-zinc-400 p-6 text-center border border-dashed border-gray-300 rounded-3xl">No banner configurations active.</p>
          )}
        </div>

      </div>

    </div>
  );
}
