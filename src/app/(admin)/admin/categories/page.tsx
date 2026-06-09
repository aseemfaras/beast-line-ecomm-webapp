"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, FolderTree } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";
import Loader from "@/components/Loader";
import { Category, Subcategory } from "@/types/category";


export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const loadCategories = async () => {
    const data = await api.get("/categories");
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadCategories()
      .catch(() => setCategories([]))
      .finally(() => setDataLoading(false));
  }, []);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      if (parentId) {
        await api.post(`/categories/${parentId}/subcategories`, { name });
      } else {
        await api.post("/categories", { name });
      }

      await loadCategories();
      setName("");
      setParentId("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    await api.del(`/categories/${id}`);
    await loadCategories();
  };

  const deleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    await api.del(`/categories/${categoryId}/subcategories/${subcategoryId}`);
    await loadCategories();
  };

  const topLevel = categories;

  if (dataLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">Category Management</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Create and manage categories and subcategories</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white border border-gray-300 rounded-xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
            <FolderTree size={16} className="text-black" /> Create Category
          </h3>

          <form onSubmit={addCategory} className="flex flex-col gap-4 text-xs text-left">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Category Name</label>
              <input
                type="text"
                // required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Footwear"
                className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 text-xs font-semibold text-black focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Parent Category (optional)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl bg-zinc-50 px-3 py-2 text-black focus:outline-none"
              >
                <option value="">No parent (top-level)</option>
                {topLevel.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

              <button type="submit" className="bg-black hover:bg-black-400 text-white py-3 rounded-xl font-bold uppercase text-xs mt-2 flex items-center justify-center gap-2 disabled:opacity-60" disabled={loading}>
              <Plus size={14} /> Add Category
            </button>

            {success && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-green-600 font-semibold text-[10px] uppercase mt-4">
                Category added!
              </div>
            )}
          </form>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          {categories.length > 0 ? (
            topLevel.map((t) => (
              <div key={t.id} className="border border-gray-300 rounded-xl overflow-hidden bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-black">{t.name}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1">{t.subcategories.length} subcategories</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteCategory(t.id)} className="p-2 text-zinc-400 hover:text-red-600 border border-gray-300 rounded-xl hover:border-red-200 transition-all" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {t.subcategories.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {t.subcategories.map((c) => (
                      <div key={c.id} className="border border-gray-300 rounded-xl p-3 flex items-center justify-between bg-zinc-50">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">{c.name}</div>
                        </div>
                        <div>
                          <button onClick={() => deleteSubcategory(t.id, c.id)} className="p-2 text-zinc-400 hover:text-red-600 rounded-xl transition-all" title="Delete Subcategory">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="italic text-zinc-400 p-6 text-center border border-dashed border-gray-300 rounded-xl">No categories created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
