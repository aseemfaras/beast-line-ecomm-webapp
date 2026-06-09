"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/app/context/AppContext";
import Loader from "@/components/Loader";
import { 
  X, 
  Search, 
  Truck, 
  MapPin, 
  CreditCard, 
  Clock, 
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, ordersLoading } = useApp();

  // Filter Tabs: All, Pending, Confipped, Delivered, Cancelled, etc.
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = activeTab === "All" || o.status === activeTab;
      const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const handleStatusChange = (orderId: string, nextStatus: any) => {
    updateOrderStatus(orderId, nextStatus);
    
    // Update local modal state to reflect changes instantly
    setSelectedOrder((prev: any) => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          status: nextStatus,
          timeline: [
            ...prev.timeline,
            {
              status: nextStatus,
              date: new Date().toLocaleString(),
              description: `Status changed to ${nextStatus} by administrator.`
            }
          ]
        };
      }
      return prev;
    });
  };

  if (ordersLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">Order Management</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Manage customer purchases, print invoices, and update shipping logs</p>
        </div>
      </section>

      {/* Filter Tabs & Search Row */}
      <section className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white border border-gray-300 p-4 rounded-xl">
        
        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 font-bold uppercase text-[10px] tracking-wider shrink-0">
          {["All", "Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                  active 
                    ? "bg-[#111111] text-white" 
                    : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search Order ID or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 pl-10 text-xs font-semibold text-black focus:border-black focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={14} />
        </div>

      </section>

      {/* Orders List Table */}
      <section className="bg-white border border-gray-300 rounded-xl overflow-hidden">
        <div className="overflow-x-auto text-xs text-left">
          {filteredOrders.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Shipping Status</th>
                  <th className="p-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 last:border-none hover:bg-zinc-50/50">
                    <td className="p-4 font-bold text-black">{o.id}</td>
                    <td className="p-4 text-zinc-500 font-semibold">{o.date}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-extrabold text-black">{o.customerName}</p>
                        <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">{o.customerEmail}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-zinc-500">{o.items.reduce((sum, item) => sum + item.quantity, 0)} Items</td>
                    <td className="p-4 font-extrabold text-black">₹{o.total}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        o.status === "Delivered" ? "bg-green-50 text-green-700" :
                        o.status === "Cancelled" ? "bg-red-50 text-red-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="bg-white hover:bg-zinc-50 text-black border border-gray-300 px-3.5 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 italic text-zinc-400">No matching orders records found.</div>
          )}
        </div>
      </section>

      {/* ORDER DETAILS MODAL EXPANSION DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="w-full max-w-2xl h-full bg-white p-6 overflow-y-auto flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-300 pb-4">
              <h3 className="font-black text-sm uppercase tracking-wider">
                Order Receipt: {selectedOrder.id}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-black"
                title="Close Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Status updater widget */}
            <div className="bg-zinc-50 border border-gray-300 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Control Ship Status</span>
                <span className="font-extrabold text-black">Current Stage: </span>
                <span className="text-[#2563EB] font-bold uppercase">{selectedOrder.status}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                <span>Move status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="border border-gray-300 rounded-xl bg-white px-3 py-2 text-black font-bold focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Details panels */}
            <div className="flex flex-col gap-6 text-xs text-left">
              
              {/* Product items ordered */}
              <div>
                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest border-b border-gray-300 pb-1.5 mb-3">Ordered Gear</h4>
                <div className="flex flex-col gap-4">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.productId} className="flex gap-4 items-center">
                      <img src={item.thumbnail} className="w-12 h-12 object-cover rounded-lg border border-gray-200" alt="" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold truncate text-black">{item.name}</h5>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                      </div>
                      <span className="font-black shrink-0 text-sm text-black">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-zinc-50 p-4 rounded-xl">
                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest mb-3">Invoice Details</h4>
                <div className="flex flex-col gap-2 font-semibold text-zinc-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-extrabold">₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST Tax (12%)</span>
                    <span className="text-black font-extrabold">₹{selectedOrder.tax}</span>
                  </div>
                  <hr className="border-gray-300 my-1" />
                  <div className="flex justify-between font-black text-sm text-black uppercase">
                    <span>Net Paid Amount</span>
                    <span className="text-[#2563EB]">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest border-b border-gray-300 pb-1.5 mb-2.5">
                    <MapPin size={12} className="inline mr-1 text-[#2563EB]" /> Delivery Address
                  </h4>
                  <p className="font-bold text-black">{selectedOrder.address.name}</p>
                  <p className="text-zinc-500 leading-relaxed">
                    {selectedOrder.address.address}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                  </p>
                  <p className="text-zinc-500">Contact: {selectedOrder.address.mobile}</p>
                </div>

                <div>
                  <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest border-b border-gray-300 pb-1.5 mb-2.5">
                    <CreditCard size={12} className="inline mr-1 text-[#2563EB]" /> Payment Ledger
                  </h4>
                  <p className="font-bold text-black">{selectedOrder.paymentMethod}</p>
                  <p className="text-zinc-500">Status: <span className="font-semibold">{selectedOrder.paymentStatus}</span></p>
                  {selectedOrder.couponUsed && (
                    <p className="text-green-600 font-bold mt-1">Discount Coupon Used: {selectedOrder.couponUsed}</p>
                  )}
                </div>
              </div>

              {/* Timeline list */}
              <div>
                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-widest border-b border-gray-300 pb-1.5 mb-3.5">
                  <Clock size={12} className="inline mr-1 text-[#2563EB]" /> Shipment Timeline Activity
                </h4>
                
                <div className="relative border-l border-gray-300 pl-5 flex flex-col gap-4 ml-1.5">
                  {selectedOrder.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[27px] top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white border border-[#2563EB]">
                        <span className="h-1 w-1 rounded-full bg-[#2563EB]" />
                      </span>
                      <div>
                        <p className="font-bold text-black uppercase text-[10px] tracking-wider">{step.status}</p>
                        <p className="text-[9px] text-zinc-400">{step.date}</p>
                        <p className="text-zinc-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="mt-auto border-t border-gray-300 pt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-[#111111] hover:bg-zinc-800 text-white py-3 rounded-xl font-bold uppercase text-xs text-center"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
