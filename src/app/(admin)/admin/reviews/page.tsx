"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/app/context/AppContext";
import Loader from "@/components/Loader";
import { Star, Check, X, Trash2, ShieldCheck, HelpCircle } from "lucide-react";

export default function AdminReviewsPage() {
  const { reviews, moderateReview, deleteReview, products, reviewsLoading, productsLoading } = useApp();

  // Tabs: All, Pending, Approved, Rejected
  const [activeTab, setActiveTab] = useState<string>("pending");

  // Reject reason modal state
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Get matching product name helper
  const getProductDetails = (productId: string) => {
    const matched = products.find(p => p.id === productId);
    return matched ? { name: matched.name, thumbnail: matched.thumbnail } : { name: "Unknown Product", thumbnail: "" };
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (activeTab === "All") return true;
      return r.status === activeTab;
    });
  }, [reviews, activeTab]);

  if (reviewsLoading || productsLoading) return <Loader />;

  return (
    <>
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">Product Reviews Moderation</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Audit customer testimonials, approve feedback, and monitor product star averages</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="flex justify-between items-center bg-white border border-gray-300 p-4 rounded-2xl">
        <div className="flex gap-2 font-bold uppercase text-[10px] tracking-wider">
          {["pending", "approved", "rejected", "All"].map((tab) => {
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
                {tab} Reviews
              </button>
            );
          })}
        </div>
      </section>

      {/* Reviews feed */}
      <section className="flex flex-col gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => {
            const product = getProductDetails(rev.productId);
            return (
              <div 
                key={rev.id} 
                className="border border-gray-300 rounded-3xl p-5 bg-white flex flex-col sm:flex-row gap-5 text-xs text-left"
              >
                {/* Product block */}
                <div className="w-full sm:w-48 shrink-0 flex items-start gap-3 border-r border-gray-300 pr-3">
                  {product.thumbnail && (
                    <img src={product.thumbnail} className="w-10 h-10 object-cover rounded-lg border border-gray-200" alt="" />
                  )}
                  <div>
                    <h5 className="font-extrabold text-black line-clamp-2 leading-tight">{product.name}</h5>
                    <p className="text-[9px] text-zinc-400 font-semibold mt-1">ID: {rev.productId}</p>
                  </div>
                </div>

                {/* Review content */}
                <div className="flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="font-extrabold text-sm text-black">{rev.userName}</span>
                      <span className="text-[10px] text-zinc-400 font-semibold">{rev.date}</span>
                    </div>

                    <div className="flex gap-0.5 text-yellow-500 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < rev.rating ? "fill-yellow-500" : "text-zinc-200"} 
                        />
                      ))}
                    </div>

                    <p className="text-zinc-500 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">
                    Status: <span className={`font-black ${
                      rev.status === "approved" ? "text-green-600" :
                      rev.status === "rejected" ? "text-red-500" :
                      "text-blue-500"
                    }`}>{rev.status}</span>
                  </span>

                  {rev.status === "rejected" && rev.rejectReason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 mt-1">
                      <p className="text-[9px] font-bold text-red-600 uppercase mb-0.5">Rejection Reason</p>
                      <p className="text-[10px] text-red-500 leading-relaxed">{rev.rejectReason}</p>
                    </div>
                  )}
                </div>

                {/* Moderate Action Buttons */}
                <div className="shrink-0 flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 sm:border-l border-gray-300 pt-3 sm:pt-0 sm:pl-5">
                  {rev.status === "pending" && (
                    <>
                      <button
                        onClick={() => moderateReview(rev.id, "approved")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl font-bold uppercase text-[9px] tracking-wider flex items-center gap-1 transition-colors"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectModalId(rev.id); setRejectReason(""); }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl font-bold uppercase text-[9px] tracking-wider flex items-center gap-1 transition-colors dark:bg-red-950/20 dark:border-red-900"
                      >
                        <X size={12} /> Reject
                      </button>
                    </>
                  )}
                  {rev.status !== "pending" && (
                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="text-zinc-400 hover:text-red-600 border border-gray-300 rounded-xl hover:border-red-200 p-2.5 transition-all text-center flex items-center justify-center gap-1.5 uppercase font-bold text-[9px] tracking-wider"
                    >
                      <Trash2 size={12} /> Delete Log
                    </button>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl bg-zinc-50 text-xs italic text-zinc-400">
            No reviews matching status "{activeTab}" require moderation.
          </div>
        )}
      </section>

    </div>

      {/* Reject Reason Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-black uppercase text-black mb-4">Reject Review</h3>
            <p className="text-xs text-zinc-500 mb-4">Provide a reason for rejecting this review. This will be shown only to the user who submitted it.</p>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inappropriate language, fake review, irrelevant content..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs focus:bg-white focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModalId(null)}
                className="flex-1 border border-zinc-200 text-zinc-500 py-3 rounded-xl font-bold uppercase text-[10px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    moderateReview(rejectModalId!, "rejected", rejectReason.trim());
                    setRejectModalId(null);
                    setRejectReason("");
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold uppercase text-[10px]"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
