"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context/AppContext";
import Loader from "@/components/Loader";
import { 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus,
  Check,
  Search,
  SlidersHorizontal
} from "lucide-react";

export default function AdminInventoryPage() {
  const { products, updateProduct, productsLoading } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStock, setFilterStock] = useState("All"); // All, Low, OOS, Normal

  // Inline adjustment state
  const [editQty, setEditQty] = useState<{ [id: string]: number }>({});
  const [successId, setSuccessId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isOOS = p.stock === 0;
    const isLow = p.stock <= p.minStock && p.stock > 0;
    
    let matchStock = true;
    if (filterStock === "OOS") matchStock = isOOS;
    else if (filterStock === "Low") matchStock = isLow;
    else if (filterStock === "Normal") matchStock = !isOOS && !isLow;

    return matchSearch && matchStock;
  });

  const handleQtyInput = (id: string, val: string) => {
    const num = parseInt(val) || 0;
    setEditQty({ ...editQty, [id]: num });
  };

  const handleApplyAdjustment = (id: string, currentStock: number) => {
    const adjustment = editQty[id] || 0;
    if (adjustment === 0) return;

    const newStock = Math.max(0, currentStock + adjustment);
    updateProduct(id, { stock: newStock });
    
    // Clear input
    setEditQty({ ...editQty, [id]: 0 });
    
    // Trigger tick success animation
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 2500);
  };

  if (productsLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">Inventory Control</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Track warehouse reserves, restock low stock thresholds, and handle audit adjustments</p>
        </div>
      </section>

      {/* Warnings Banner row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Out of Stock banner */}
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="text-red-600 shrink-0 animate-pulse" size={20} />
          <div className="text-xs">
            <h5 className="font-extrabold text-red-800 uppercase">Out Of Stock Alerts</h5>
            <p className="text-red-600 font-semibold mt-0.5">
              {products.filter(p => p.stock === 0).length} items are currently at 0 units
            </p>
          </div>
        </div>

        {/* Low Stock banner */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <div className="text-xs">
            <h5 className="font-extrabold text-amber-800 uppercase">Low Stock Alerts</h5>
            <p className="text-amber-600 font-semibold mt-0.5">
              {products.filter(p => p.stock <= p.minStock && p.stock > 0).length} items have breached safety reserves
            </p>
          </div>
        </div>

        {/* Normal Stock banner */}
        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
          <Check className="text-green-600 bg-green-50 p-0.5 rounded-full shrink-0" size={20} />
          <div className="text-xs">
            <h5 className="font-extrabold text-green-800 uppercase">Optimal Inventory</h5>
            <p className="text-green-600 font-semibold mt-0.5">
              {products.filter(p => p.stock > p.minStock).length} items are fully stocked
            </p>
          </div>
        </div>

      </section>

      {/* Search & filters controls */}
      <section className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-gray-300 p-4 rounded-2xl">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 pl-10 text-xs font-semibold text-black focus:border-black focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={14} />
        </div>

        {/* Stock status filter tabs */}
        <div className="flex gap-2 text-xs font-bold text-zinc-400 uppercase items-center shrink-0">
          <span>Filter Stock:</span>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="border border-gray-300 rounded-xl bg-zinc-50 px-3 py-2 text-black font-bold focus:outline-none"
          >
            <option value="All">All Products</option>
            <option value="OOS">Out Of Stock (0)</option>
            <option value="Low">Low Stock (&le; min)</option>
            <option value="Normal">Fully Stocked (&gt; min)</option>
          </select>
        </div>

      </section>

      {/* Inventory table */}
      <section className="bg-white border border-gray-300 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto text-xs text-left">
          {filteredProducts.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="p-4">Product Info</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Min Limit</th>
                  <th className="p-4">Current Units</th>
                  <th className="p-4">Quick Adjust Stock Count</th>
                  <th className="p-4 text-center">Save Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isOOS = p.stock === 0;
                  const isLow = p.stock <= p.minStock && p.stock > 0;
                  
                  const isSuccess = successId === p.id;
                  const adjustmentValue = editQty[p.id] || "";

                  return (
                    <tr key={p.id} className="border-b border-gray-100 last:border-none hover:bg-zinc-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.thumbnail} className="w-10 h-10 object-cover rounded-lg border border-gray-200" alt="" />
                          <div>
                            <p className="font-extrabold text-black text-sm line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">{p.brand} • {p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-zinc-500">{p.sku}</td>
                      <td className="p-4 font-bold text-zinc-500">{p.minStock} Units</td>
                      <td className="p-4">
                        {isOOS ? (
                          <span className="px-2.5 py-0.5 rounded bg-red-50 text-red-700 font-bold uppercase text-[9px]">Out Of Stock</span>
                        ) : isLow ? (
                          <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold uppercase text-[9px]">Low ({p.stock})</span>
                        ) : (
                          <span className="font-extrabold text-green-600">{p.stock} Units</span>
                        )}
                      </td>
                      <td className="p-4">
                        
                        {/* Quick stock adjustment inputs */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="e.g. +5 or -2"
                            value={adjustmentValue}
                            onChange={(e) => handleQtyInput(p.id, e.target.value)}
                            className="w-24 rounded-lg border border-gray-300 bg-zinc-50 px-3 py-1.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none"
                          />
                          <span className="text-[10px] text-zinc-400 font-bold">units</span>
                        </div>

                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleApplyAdjustment(p.id, p.stock)}
                          disabled={!adjustmentValue}
                          className={`px-3.5 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-1 mx-auto ${
                            isSuccess 
                              ? "bg-green-600 text-white" 
                              : "bg-[#111111] hover:bg-zinc-800 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          }`}
                        >
                          {isSuccess ? <Check size={12} /> : null}
                          {isSuccess ? "Adjusted" : "Apply"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 italic text-zinc-400">No products matching inventory search criteria.</div>
          )}
        </div>
      </section>

    </div>
  );
}
