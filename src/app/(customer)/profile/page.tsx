"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import { Order, ProfileAddress } from "@/types/order";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import {
  User as UserIcon,
  MapPin,
  KeyRound,
  Package,
  Clock,
  Check,
  ArrowRight,
  Info,
  Calendar,
  Undo2
} from "lucide-react";


const getAddressStorageKey = (userId: string) => `athletica_profile_addresses_${userId}`;

export default function ProfilePage() {
  const { currentUser, orders, updateProfile, requestReturn, returns } = useApp();
  const router = useRouter();

  const [checked, setChecked] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("orders");

  // Profile Edit fields
  const [name, setName] = useState(currentUser?.name || "");
  const [mobile, setMobile] = useState(currentUser?.mobile || "");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync profile fields when currentUser loads asynchronously
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setMobile(currentUser.mobile || "");
    }
  }, [currentUser]);

  // Password Edit fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Address edit simulation
  const [addresses, setAddresses] = useState<ProfileAddress[]>(() => {
    if (!currentUser || typeof window === "undefined") return [];

    const storedAddresses = localStorage.getItem(getAddressStorageKey(currentUser.id));
    if (storedAddresses) return JSON.parse(storedAddresses);

    return [
      { id: "1", type: "Home", name: currentUser.name, mobile: currentUser.mobile, address: "124 Athletic Way, Sports District", city: "Los Angeles", state: "CA", pincode: "90001" }
    ];
  });
  const [newAddress, setNewAddress] = useState({ type: "Work", name: "", mobile: "", address: "", city: "", state: "", pincode: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Order timeline toggle expand
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Return request form state
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnProductId, setReturnProductId] = useState<string | null>(null);
  const [returnProductName, setReturnProductName] = useState("");
  const [returnProductImg, setReturnProductImg] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnFormSubmitted, setReturnFormSubmitted] = useState(false);
  const [returnEvidenceFile, setReturnEvidenceFile] = useState<File | null>(null);
  const [returnEvidencePreview, setReturnEvidencePreview] = useState<string>("");

  // Wait for profile to load from token before checking auth
  React.useEffect(() => {
    const timer = setTimeout(() => setChecked(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if guest (only after auth check window)
  React.useEffect(() => {
    if (checked && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, checked]);

  // Load addresses from localStorage when currentUser becomes available
  React.useEffect(() => {
    if (!currentUser || typeof window === "undefined") return;
    const storedAddresses = localStorage.getItem(getAddressStorageKey(currentUser.id));
    if (storedAddresses) {
      setAddresses(JSON.parse(storedAddresses));
    } else {
      setAddresses([
        { id: "1", type: "Home", name: currentUser.name, mobile: currentUser.mobile, address: "124 Athletic Way, Sports District", city: "Los Angeles", state: "CA", pincode: "90001" }
      ]);
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getAddressStorageKey(currentUser.id), JSON.stringify(addresses));
  }, [addresses, currentUser]);

  // Filter orders matching current user
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => o.customerId === currentUser.id);
  }, [orders, currentUser]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, mobile);
    setProfileSuccess(true);
    toast.success("Profile updated successfully!");
    setTimeout(() => setProfileSuccess(false), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPassword && newPassword) {
      setPasswordSuccess(true);
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddresses([...addresses, { ...newAddress, id: Date.now().toString() }]);
    toast.success("Address added successfully!");
    setNewAddress({ type: "Work", name: "", mobile: "", address: "", city: "", state: "", pincode: "" });
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleOpenReturnForm = (orderId: string, item: any) => {
    setReturnOrderId(orderId);
    setReturnProductId(item.productId);
    setReturnProductName(item.name);
    setReturnProductImg(item.thumbnail);
    setReturnReason("");
    setReturnFormSubmitted(false);
    setReturnEvidenceFile(null);
    setReturnEvidencePreview("");
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (returnOrderId && returnProductId && returnReason.trim()) {
      let evidenceImage: string | undefined;
      if (returnEvidenceFile) {
        evidenceImage = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Failed to read evidence file"));
          reader.readAsDataURL(returnEvidenceFile);
        });
      }
      requestReturn(returnOrderId, returnProductId, returnProductName, returnProductImg, returnReason, evidenceImage);
      setReturnFormSubmitted(true);
      setTimeout(() => {
        setReturnOrderId(null);
        setReturnProductId(null);
        setReturnFormSubmitted(false);
        setReturnEvidenceFile(null);
        setReturnEvidencePreview("");
      }, 3000);
    }
  };

  if (!currentUser) return <Loader />;

  return (
    <div className="w-full bg-white text-black dark:bg-white dark:text-black min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* User Header Profile Card */}
        <div className="bg-white text-black rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 ">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Athletica Club Member</span>
            <h1 className="text-3xl font-black uppercase tracking-tight mt-1">{currentUser.name}</h1>
            <p className="text-xs text-zinc-500 font-semibold mt-0.5">{currentUser.email}</p>
          </div>
          <div className="flex gap-4 text-center shrink-0">
            <div className="border border-gray-300 px-4 py-2.5 rounded-2xl bg-zinc-50">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Orders Placed</p>
              <p className="text-lg font-black text-black mt-0.5">{userOrders.length}</p>
            </div>
            <div className="border border-gray-300 px-4 py-2.5 rounded-2xl bg-zinc-50">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Spending</p>
              <p className="text-lg font-black text-[#2563EB] mt-0.5">₹{currentUser.spending}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Navigation Sidebar Tabs (3 cols) */}
          <aside className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase rounded-xl tracking-wider transition-all text-left shrink-0 lg:w-full ${activeTab === "orders" ? "bg-zinc-100 text-black dark:bg-zinc-100 dark:text-black" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-50"
                }`}
            >
              <Package size={15} /> Order History
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase rounded-xl tracking-wider transition-all text-left shrink-0 lg:w-full ${activeTab === "profile" ? "bg-zinc-100 text-black dark:bg-zinc-100 dark:text-black" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-50"
                }`}
            >
              <UserIcon size={15} /> Personal Info
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase rounded-xl tracking-wider transition-all text-left shrink-0 lg:w-full ${activeTab === "addresses" ? "bg-zinc-100 text-black dark:bg-zinc-100 dark:text-black" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-50"
                }`}
            >
              <MapPin size={15} /> Manage Addresses
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase rounded-xl tracking-wider transition-all text-left shrink-0 lg:w-full ${activeTab === "password" ? "bg-zinc-100 text-black dark:bg-zinc-100 dark:text-black" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-50"
                }`}
            >
              <KeyRound size={15} /> Change Password
            </button>
          </aside>

          {/* Tab View Contents (9 cols) */}
          <main className="lg:col-span-9">

            {/* TAB 1: ORDER HISTORY */}
            {activeTab === "orders" && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-black uppercase mb-4 text-[#111111] dark:text-black">Your Orders</h2>

                {userOrders.length > 0 ? (
                  userOrders.map((order) => {
                    const expanded = expandedOrderId === order.id;

                    // Check if order has active return requests
                    const returnRequest = returns.find(r => r.orderId === order.id);

                    return (
                      <div key={order.id} className="border border-zinc-100 rounded-3xl overflow-hidden bg-white dark:border-zinc-100 dark:bg-white">

                        {/* Summary card bar */}
                        <div
                          onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-50 transition-colors"
                        >
                          <div className="text-xs">
                            <p className="font-bold text-[#111111] dark:text-black">Order {order.id}</p>
                            <p className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Placed: {order.date}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-500">
                            <div>
                              <p className="text-[10px] text-zinc-400 uppercase font-bold">Total Amount</p>
                              <p className="font-extrabold text-[#111111] dark:text-black">₹{order.total}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-400 uppercase font-bold">Payment Status</p>
                              <p className="font-bold">{order.paymentStatus}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-400 uppercase font-bold">Shipping Status</p>
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === "Delivered" ? "bg-green-50 text-green-700" :
                                order.status === "Cancelled" ? "bg-red-50 text-red-700" :
                                  "bg-blue-50 text-blue-700"
                                }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded order details */}
                        {expanded && (
                          <div className="border-t border-zinc-100 p-6 bg-zinc-50/50 dark:border-zinc-100 dark:bg-zinc-50/50 text-xs">

                            {/* Order items lists */}
                            <div className="mb-6">
                              <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-wider mb-3">Order Items</h4>
                              <div className="flex flex-col gap-4">
                                {order.items.map((item) => (
                                  <div key={item.productId} className="flex gap-4 items-center">
                                    <div className="w-14 h-14 bg-zinc-100 border rounded-xl overflow-hidden shrink-0 dark:bg-zinc-100">
                                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-bold truncate text-sm text-[#111111] dark:text-black">{item.name}</h5>
                                      <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="font-black text-sm text-[#111111] dark:text-black">₹{item.price * item.quantity}</p>

                                      {/* Return Item trigger */}
                                      {order.status === "Delivered" && !returnRequest && (
                                        <button
                                          onClick={() => handleOpenReturnForm(order.id, item)}
                                          className="text-[9px] font-black text-red-500 hover:underline uppercase block mt-1"
                                        >
                                          Return Item
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-900 mb-6" />

                            {/* Address & Payment summaries */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                              <div>
                                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-wider mb-2">Shipping Details</h4>
                                <p className="font-bold text-[#111111] dark:text-black">{order.address.name}</p>
                                <p className="text-zinc-500">{order.address.address}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                <p className="text-zinc-500">Phone: {order.address.mobile}</p>
                              </div>
                              <div>
                                <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-wider mb-2">Payment Details</h4>
                                <p className="font-bold text-[#111111] dark:text-black">{order.paymentMethod}</p>
                                <p className="text-zinc-500">Transaction Status: {order.paymentStatus}</p>
                                {order.couponUsed && <p className="text-green-600 font-bold">Coupon Code: {order.couponUsed}</p>}
                              </div>
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-200 mb-6" />

                            {/* Order Tracking Timeline Tree */}
                            <div>
                              <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                                <Clock size={12} /> Order Tracking Status Timeline
                              </h4>

                              <div className="relative border-l border-zinc-200 pl-6 flex flex-col gap-6 ml-2 dark:border-zinc-200">
                                {order.timeline.map((step, idx) => (
                                  <div key={idx} className="relative">
                                    {/* Point circle */}
                                    <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-[#2563EB] dark:bg-white">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                                    </span>
                                    <div>
                                      <p className="font-extrabold text-[#111111] dark:text-black">{step.status}</p>
                                      <p className="text-[10px] text-zinc-400 font-semibold">{step.date}</p>
                                      <p className="text-zinc-500 mt-1 leading-relaxed">{step.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Return Request status if active */}
                              {returnRequest && (
                                <div className="mt-6 bg-red-50/50 border border-red-100 rounded-xl p-4 text-xs dark:bg-red-50/50 dark:border-red-100">
                                  <h5 className="font-bold text-red-700 uppercase mb-1">Return request logged</h5>
                                  <p className="text-zinc-500 leading-relaxed">
                                    Reason: "{returnRequest.reason}"
                                  </p>
                                  <p className="font-bold text-[#111111] dark:text-zinc-800 mt-2">
                                    Moderation Status: <span className={`uppercase ${returnRequest.status === "Approved" ? "text-green-600" :
                                      returnRequest.status === "Rejected" ? "text-red-500" :
                                        "text-blue-500"
                                      }`}>{returnRequest.status}</span>
                                  </p>
                                </div>
                              )}

                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 border border-dashed border-zinc-200 rounded-3xl bg-zinc-50 dark:border-zinc-200 dark:bg-zinc-50">
                    <p className="text-sm font-semibold text-zinc-500 mb-4">No order records found.</p>
                    <Link href="/products" className="bg-[#111111] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase">
                      Browse Gear
                    </Link>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: PERSONAL INFO */}
            {activeTab === "profile" && (
              <div className="border border-zinc-100 rounded-3xl p-6 bg-white dark:border-zinc-100 dark:bg-white max-w-xl">
                <h2 className="text-xl font-black uppercase mb-6 text-[#111111] dark:text-black">Profile Details</h2>

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none dark:border-zinc-200 dark:bg-zinc-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full rounded-xl border border-zinc-100 bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-400 cursor-not-allowed dark:border-zinc-100 dark:bg-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none dark:border-zinc-200 dark:bg-zinc-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-white text-black hover:bg-black hover:text-white border border-zinc-200 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors mt-2 dark:bg-white dark:text-black"
                  >
                    Save Changes
                  </button>
                </form>

                {profileSuccess && (
                  <div className="flex items-center gap-1.5 text-green-600 font-semibold mt-3 text-xs">
                    <Check size={14} className="bg-green-50 p-0.5 rounded-full" />
                    <span>Profile updated successfully!</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-black uppercase text-[#111111] dark:text-black">Your Address Book</h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="bg-white text-black hover:bg-black hover:text-white border border-zinc-200 py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    {showAddressForm ? "Cancel" : "Add Address"}
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="border border-zinc-100 rounded-3xl p-6 bg-zinc-50 text-xs dark:bg-zinc-50 dark:border-zinc-100 max-w-xl">
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-4">Add New Location</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Tag (e.g. Home, Work)</label>
                        <input
                          type="text"
                          required
                          value={newAddress.type}
                          onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold focus:outline-none dark:border-zinc-200 dark:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Recipient Name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold focus:outline-none dark:border-zinc-200 dark:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Mobile Phone</label>
                        <input
                          type="tel"
                          required
                          value={newAddress.mobile}
                          onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold focus:outline-none dark:border-zinc-200 dark:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold focus:outline-none dark:border-zinc-200 dark:bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Complete Address</label>
                        <textarea
                          required
                          rows={2}
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold focus:outline-none dark:border-zinc-200 dark:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold focus:outline-none dark:border-zinc-200 dark:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold focus:outline-none dark:border-zinc-200 dark:bg-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-black hover:text-white border border-zinc-200  py-3 rounded-xl font-bold uppercase text-xs mt-6"
                    >
                      Add Location
                    </button>
                  </form>
                )}

                {/* Address List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div key={a.id} className="border border-zinc-100 rounded-3xl p-5 bg-white dark:border-zinc-100 dark:bg-white text-xs flex justify-between items-start gap-4">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-700 mb-3">{a.type}</span>
                        <p className="font-bold text-sm text-[#111111] dark:text-black">{a.name}</p>
                        <p className="text-zinc-500 mt-1 leading-relaxed">{a.address}, {a.city}, {a.state} - {a.pincode}</p>
                        <p className="text-zinc-500">Phone: {a.mobile}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(a.id)}
                        className="text-[9px] font-black text-red-500 hover:underline uppercase shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 4: CHANGE PASSWORD */}
            {activeTab === "password" && (
              <div className="border border-zinc-100 rounded-3xl p-6 bg-white dark:border-zinc-100 dark:bg-white max-w-xl">
                <h2 className="text-xl font-black uppercase mb-6 text-[#111111] dark:text-black">Security Settings</h2>

                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none dark:border-zinc-200 dark:bg-zinc-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">New Secure Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none dark:border-zinc-200 dark:bg-zinc-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-white text-black border border border-zinc-300 hover:bg-black hover:text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors mt-2 dark:bg-white dark:text-black"
                  >
                    Change Password
                  </button>
                </form>

                {passwordSuccess && (
                  <div className="flex items-center gap-1.5 text-green-600 font-semibold mt-3 text-xs">
                    <Check size={14} className="bg-green-50 p-0.5 rounded-full" />
                    <span>Password updated successfully!</span>
                  </div>
                )}
              </div>
            )}

          </main>

        </div>

        {/* RETURN PRODUCT MODAL OVERLAY */}
        {returnOrderId && returnProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl dark:bg-white dark:border dark:border-zinc-100">
              <h3 className="text-base font-black uppercase text-[#111111] dark:text-black mb-4">Request Item Return</h3>

              {returnFormSubmitted ? (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <Check className="text-green-600 bg-green-50 p-2 rounded-full" size={32} />
                  <h5 className="font-bold text-xs uppercase">Return Logged Successfully</h5>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Your return request has been submitted to Athletica. It will be reviewed by admin within 24 hours. Check updates on your order details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReturnSubmit} className="flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl dark:bg-zinc-50">
                    <img src={returnProductImg} className="w-10 h-10 object-cover rounded-lg border shrink-0" alt="" />
                    <div>
                      <h5 className="font-bold truncate max-w-[200px]">{returnProductName}</h5>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Order: {returnOrderId}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Reason for Return</label>
                    <textarea
                      required
                      rows={4}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Provide detailed feedback on why you'd like to return this product (e.g. size fits too small, got wrong color, damaged package, etc.)"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs focus:bg-white focus:outline-none dark:border-zinc-200 dark:bg-zinc-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Evidence Image (Upload Photo)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setReturnEvidenceFile(file);
                        if (file) {
                          setReturnEvidencePreview(URL.createObjectURL(file));
                        } else {
                          setReturnEvidencePreview("");
                        }
                      }}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    />
                    {returnEvidencePreview && (
                      <img src={returnEvidencePreview} alt="Evidence preview" className="mt-2 w-20 h-20 object-cover rounded-xl border border-zinc-200" />
                    )}
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => { setReturnOrderId(null); setReturnProductId(null); }}
                      className="flex-1 border border-zinc-200 text-zinc-500 py-3 rounded-xl font-bold uppercase text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold uppercase text-[10px]"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
