"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context/AppContext";
import Loader from "@/components/Loader";
import { Check, X, RotateCcw, AlertCircle, ShoppingBag } from "lucide-react";

export default function AdminReturnsPage() {
  const { returns, moderateReturn, returnsLoading } = useApp();

  const [activeTab, setActiveTab] = useState<string>("All");

  const filteredReturns = returns.filter((r) => {
    if (activeTab === "All") return true;
    return r.status === activeTab;
  });

  if (returnsLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">Return Claims Center</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Approve reverse logistics, evaluate customer refund requests, and audit restocking balances</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="flex justify-between items-center bg-white border border-gray-300 p-4 rounded-2xl">
        <div className="flex gap-2 font-bold uppercase text-[10px] tracking-wider">
          {["Pending", "Approved", "Rejected", "All"].map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  active 
                    ? "bg-[#111111] text-white" 
                    : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {tab} Claims
              </button>
            );
          })}
        </div>
      </section>

      {/* Returns list */}
      <section className="flex flex-col gap-4">
        {filteredReturns.length > 0 ? (
          filteredReturns.map((ret) => (
            <div 
              key={ret.id} 
              className="border border-gray-300 rounded-3xl p-5 bg-white flex flex-col sm:flex-row gap-5 text-xs text-left"
            >
              {/* Product and Order details */}
              <div className="w-full sm:w-56 shrink-0 flex items-start gap-3 border-r border-gray-300 pr-3">
                <img src={ret.thumbnail} className="w-10 h-10 object-cover rounded-lg border border-gray-200" alt="" />
                <div className="min-w-0">
                  <h5 className="font-extrabold text-black line-clamp-2 leading-tight">{ret.productName}</h5>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-1">Order: {ret.orderId}</p>
                  <p className="text-[9px] text-zinc-400 font-semibold">Date Logged: {ret.date}</p>
                </div>
              </div>

              {/* Customer and Reason */}
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h5 className="font-extrabold text-sm text-black">Customer: {ret.customerName}</h5>
                  <p className="text-zinc-500 leading-relaxed mt-2 italic bg-zinc-50 p-3 rounded-xl">
                    Reason: "{ret.reason}"
                  </p>
                  {ret.evidenceImage && (
                    <div className="mt-3">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Evidence Image:</p>
                      <a href={ret.evidenceImage} target="_blank" rel="noopener noreferrer">
                        <img src={ret.evidenceImage} alt="Return evidence" className="w-24 h-24 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                  <span>Claims Status: </span>
                  <span className={`font-black ${
                    ret.status === "Approved" ? "text-green-600" :
                    ret.status === "Rejected" ? "text-red-500" :
                    "text-blue-500"
                  }`}>{ret.status}</span>
                </div>
              </div>

              {/* Approve / Reject actions */}
              <div className="shrink-0 flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 sm:border-l border-gray-300 pt-3 sm:pt-0 sm:pl-5">
                {ret.status === "Pending" ? (
                  <>
                    <button
                      onClick={() => moderateReturn(ret.id, "Approved")}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl font-bold uppercase text-[9px] tracking-wider flex items-center gap-1 transition-colors"
                      title="Approve refund and restock item count"
                    >
                      <Check size={12} /> Approve Claim
                    </button>
                    <button
                      onClick={() => moderateReturn(ret.id, "Rejected")}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl font-bold uppercase text-[9px] tracking-wider flex items-center gap-1 transition-colors dark:bg-red-950/20 dark:border-red-900"
                    >
                      <X size={12} /> Reject Claim
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-zinc-400 font-bold uppercase italic py-4">Processed</span>
                )}
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl bg-zinc-50 text-xs italic text-zinc-400">
            No return claims currently matching status "{activeTab}".
          </div>
        )}
      </section>

    </div>
  );
}
