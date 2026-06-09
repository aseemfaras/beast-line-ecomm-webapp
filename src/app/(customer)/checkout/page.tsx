"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { OrderAddress, ProfileAddress } from "@/types/order";
import { Coupon } from "@/types/coupon";
import Loader from "@/components/Loader";
import { CreditCard, Truck, CheckCircle2, ChevronRight, ShoppingBag, Landmark, Coins } from "lucide-react";


const getAddressStorageKey = (userId: string) => `athletica_profile_addresses_${userId}`;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, currentUser, placeOrder, cartLoading } = useApp();
  const router = useRouter();

  // Redirect if cart is empty
  const activeItems = useMemo(() => cart.filter(item => !item.savedForLater), [cart]);

  // Checkout stages
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedProfileAddressId, setSelectedProfileAddressId] = useState("");
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [profileAddresses, setProfileAddresses] = useState<ProfileAddress[]>([]);

  // Address Form State
  const [address, setAddress] = useState<OrderAddress>({
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  // Pre-fill from profile details if logged in
  useEffect(() => {
    if (currentUser) {
      setAddress((prev) => ({
        ...prev,
        name: currentUser.name,
        mobile: currentUser.mobile || ""
      }));
    }
  }, [currentUser]);

  // Load profile addresses from localStorage when currentUser is available
  useEffect(() => {
    if (!currentUser || typeof window === "undefined") return;
    const storedAddresses = localStorage.getItem(getAddressStorageKey(currentUser.id));
    if (storedAddresses) {
      setProfileAddresses(JSON.parse(storedAddresses));
    } else {
      setProfileAddresses([]);
    }
  }, [currentUser]);

  const handleSaveNewAddress = () => {
    if (!currentUser) return;
    if (!address.name || !address.mobile || !address.address || !address.city || !address.state || !address.pincode) {
      setError("Please fill all address fields.");
      return;
    }
    const newAddress: ProfileAddress = {
      id: `addr_${Date.now()}`,
      type: "New",
      ...address,
    };
    const updated = [...profileAddresses, newAddress];
    setProfileAddresses(updated);
    localStorage.setItem(getAddressStorageKey(currentUser.id), JSON.stringify(updated));
    setSelectedProfileAddressId(newAddress.id);
    setShowAddAddressForm(false);
    setError("");
  };

  const selectedProfileAddress = useMemo(() => {
    if (profileAddresses.length === 0) return null;
    return profileAddresses.find((item) => item.id === selectedProfileAddressId) || profileAddresses[0];
  }, [profileAddresses, selectedProfileAddressId]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Read checkout coupon from localStorage (stored in Cart page)
  const checkoutCoupon = useMemo<Coupon | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("athletica_checkout_coupon");
    return stored ? JSON.parse(stored) : null;
  }, []);

  // Price calculations
  const subtotal = useMemo(() => {
    return activeItems.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  }, [activeItems]);

  const discountAmount = useMemo(() => {
    if (!checkoutCoupon) return 0;
    if (checkoutCoupon.type === "percentage") {
      return Math.round(subtotal * (checkoutCoupon.value / 100));
    } else {
      return checkoutCoupon.value;
    }
  }, [checkoutCoupon, subtotal]);

  const taxAmount = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return Math.round(taxableAmount * 0.12);
  }, [subtotal, discountAmount]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  // Handle form submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    if (activeItems.length === 0) return;

    const checkoutAddress = selectedProfileAddress || address;

    setError("");
    try {
      // Place the order via context
      const response = await placeOrder(checkoutAddress, paymentMethod, checkoutCoupon);

      if (response && response.requiresPayment) {
        // Complete payment with Razorpay
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setError("Failed to load Razorpay SDK. Please check your internet connection.");
          return;
        }

        const razorpayKey = (response.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder").trim();

        const options = {
          key: razorpayKey,
          amount: response.razorpayOrder.amount,
          currency: response.razorpayOrder.currency,
          name: "Athletica Sportswear",
          description: "Order Checkout Payment",
          order_id: response.razorpayOrder.id,
          method: {
            netbanking: "1",
            card: "1",
            wallet: "1",
            upi: "1",
            paylater: "1",
          },
          handler: async function (paymentRes: any) {
            try {
              setError("");
              const verifyResponse = await placeOrder(checkoutAddress, paymentMethod, checkoutCoupon, {
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_order_id: paymentRes.razorpay_order_id,
                razorpay_signature: paymentRes.razorpay_signature,
              });

              if (verifyResponse && verifyResponse.order) {
                setCreatedOrder(verifyResponse.order);
                setIsConfirmed(true);
                localStorage.removeItem("athletica_checkout_coupon");
              }
            } catch (err: any) {
              setError(err.message || "Payment verification failed. Please try again.");
            }
          },
          prefill: {
            name: checkoutAddress.name,
            contact: checkoutAddress.mobile,
            email: currentUser.email,
          },
          modal: {
            ondismiss: function () {
              setError("Payment was cancelled. You can try again or choose a different payment method.");
            },
          },
          theme: {
            color: "#111111",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          const errorCode = response?.error?.code || "UNKNOWN";
          const errorDesc = response?.error?.description || "Payment failed";
          setError(`Payment failed: ${errorDesc} (Code: ${errorCode})`);
        });
        rzp.open();
      } else if (response && response.order) {
        setCreatedOrder(response.order);
        setIsConfirmed(true);
        // Clean up coupon storage
        localStorage.removeItem("athletica_checkout_coupon");
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    }
  };

  // If order is completed, show success screen
  if (isConfirmed && createdOrder) {
    return (
      <div className="w-full bg-white text-black dark:bg-white dark:text-black min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-xl px-4 py-20 text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="text-black mb-6 animate-bounce" size={56} />

          <h1 className="text-3xl font-black uppercase tracking-tight text-[#111111] mb-2">
            Order Confirmed!
          </h1>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-6">
            Order ID: <span className="text-black font-bold">{createdOrder.id}</span>
          </p>

          <div className="w-full border border-zinc-100 rounded-2xl p-6 bg-zinc-50 mb-8 text-left text-xs text-zinc-500">
            <h3 className="font-black text-[#111111] uppercase mb-4 pb-2 border-b border-zinc-200">Receipt Details</h3>

            <div className="flex flex-col gap-2 font-semibold">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="text-[#111111]">₹{createdOrder.subtotal}</span>
              </div>
              {createdOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount applied</span>
                  <span>-₹{createdOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (12%)</span>
                <span className="text-[#111111]">₹{createdOrder.tax}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#111111] border-t border-zinc-200 pt-2">
                <span>Amount Paid</span>
                <span className="text-black">₹{createdOrder.total}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-bold text-[#111111] uppercase mb-1">Shipping To:</h4>
              <p className="font-medium">{createdOrder.address.name}</p>
              <p>{createdOrder.address.address}, {createdOrder.address.city}, {createdOrder.address.state} - {createdOrder.address.pincode}</p>
              <p>Mobile: {createdOrder.address.mobile}</p>
            </div>

            <div className="mt-4">
              <h4 className="font-bold text-[#111111] uppercase mb-1">Estimated Delivery:</h4>
              <p className="font-bold text-green-600">Arriving in 3 working days via Athletica Express</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              href="/profile"
              className="flex-1 bg-[#111111] hover:bg-zinc-800 text-white py-3  font-bold uppercase tracking-wider text-xs text-center"
            >
              Track Order status
            </Link>
            <Link
              href="/"
              className="flex-1 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 py-3  font-bold uppercase tracking-wider text-xs text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartLoading) return <Loader />;

  return (
    <div className="w-full bg-white text-black dark:bg-white dark:text-black min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-8">
          <Link href="/cart" className="hover:text-black">Cart</Link>
          <ChevronRight size={10} />
          <span className="text-[#111111]">Checkout</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111111] mb-8">
          Checkout
        </h1>

        {activeItems.length > 0 ? (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Shipping and Payment forms (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-8">

              {/* Shipping Address Box */}
              <div className="border border-zinc-100 rounded-3xl p-6 bg-white">
                <h3 className="font-black text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Truck size={16} className="text-black" /> 1. Shipping Address
                </h3>

                {profileAddresses.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {profileAddresses.map((profileAddress) => (
                      <label
                        key={profileAddress.id}
                        className={`border p-4 rounded-2xl cursor-pointer transition-all ${
                          selectedProfileAddress?.id === profileAddress.id ? "border-[#2563EB] bg-blue-50/20" : "border-zinc-100 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="profile-address"
                            checked={selectedProfileAddress?.id === profileAddress.id}
                            onChange={() => {
                              setSelectedProfileAddressId(profileAddress.id);
                              setAddress({
                                name: profileAddress.name,
                                mobile: profileAddress.mobile,
                                address: profileAddress.address,
                                city: profileAddress.city,
                                state: profileAddress.state,
                                pincode: profileAddress.pincode
                              });
                            }}
                            className="mt-1 border-zinc-300 text-black focus:ring-[#2563EB] w-4 h-4"
                          />
                          <div className="text-xs">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-700 mb-3">{profileAddress.type}</span>
                            <p className="font-bold text-sm text-[#111111]">{profileAddress.name}</p>
                            <p className="text-zinc-500 mt-1 leading-relaxed">
                              {profileAddress.address}, {profileAddress.city}, {profileAddress.state} - {profileAddress.pincode}
                            </p>
                            <p className="text-zinc-500">Phone: {profileAddress.mobile}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Add Address Button */}
                {!showAddAddressForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAddressForm(true);
                      setAddress({ name: currentUser?.name || "", mobile: currentUser?.mobile || "", address: "", city: "", state: "", pincode: "" });
                    }}
                    className="w-full border-2 border-dashed border-zinc-300 hover:border-black text-black font-bold uppercase text-xs tracking-wider py-3 rounded-2xl transition-all hover:bg-zinc-50"
                  >
                    + Add New Address
                  </button>
                )}

                {/* Address Form (shown when no addresses or when Add Address is clicked) */}
                {(showAddAddressForm || profileAddresses.length === 0) && (
                <div className={profileAddresses.length > 0 ? "mt-4 border border-zinc-200 rounded-2xl p-4" : ""}>
                  {profileAddresses.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-black">New Address</h4>
                      <button type="button" onClick={() => setShowAddAddressForm(false)} className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase">Cancel</button>
                    </div>
                  )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="w-full  border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={address.mobile}
                      onChange={(e) => setAddress({ ...address, mobile: e.target.value })}
                      className="w-full  border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="w-full  border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Delivery Address</label>
                    <textarea
                      required
                      rows={3}
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      className="w-full  border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full  border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full  border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-black focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Save Address Button (when adding new) */}
                  {profileAddresses.length > 0 && showAddAddressForm && (
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleSaveNewAddress}
                        className="w-full bg-black text-white py-2.5 font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-zinc-800 transition-colors"
                      >
                        Save Address
                      </button>
                    </div>
                  )}

                </div>
                </div>
                )}
              </div>

              {/* Payment Method Selector Box */}
              <div className="border border-zinc-100 rounded-3xl p-6 bg-white">
                <h3 className="font-black text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <CreditCard size={16} className="text-black" /> 2. Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Razorpay (Cards / Netbanking) */}
                  <label className={`border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "Razorpay" ? "border-[#2563EB] bg-blue-50/20" : "border-zinc-100 hover:border-zinc-300"
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment-option"
                        checked={paymentMethod === "Razorpay"}
                        onChange={() => setPaymentMethod("Razorpay")}
                        className="border-zinc-300 text-black focus:ring-[#2563EB] w-4 h-4"
                      />
                      <div className="text-xs">
                        <p className="font-bold">Razorpay Gateway</p>
                        <p className="text-[10px] text-zinc-400">Cards, Netbanking, Wallets</p>
                      </div>
                    </div>
                    <ShoppingBag size={18} className="text-zinc-400 shrink-0" />
                  </label>

                  {/* UPI */}
                  <label className={`border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "UPI" ? "border-[#2563EB] bg-blue-50/20" : "border-zinc-100 hover:border-zinc-300"
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment-option"
                        checked={paymentMethod === "UPI"}
                        onChange={() => setPaymentMethod("UPI")}
                        className="border-zinc-300 text-black focus:ring-[#2563EB] w-4 h-4"
                      />
                      <div className="text-xs">
                        <p className="font-bold">Instant UPI Transfer</p>
                        <p className="text-[10px] text-zinc-400">GPay, PhonePe, Paytm</p>
                      </div>
                    </div>
                    <Landmark size={18} className="text-zinc-400 shrink-0" />
                  </label>

                  {/* Credit Card Direct */}
                  <label className={`border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "CreditCard" ? "border-[#2563EB] bg-blue-50/20" : "border-zinc-100 hover:border-zinc-300"
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment-option"
                        checked={paymentMethod === "CreditCard"}
                        onChange={() => setPaymentMethod("CreditCard")}
                        className="border-zinc-300 text-black focus:ring-[#2563EB] w-4 h-4"
                      />
                      <div className="text-xs">
                        <p className="font-bold">Credit/Debit Card</p>
                        <p className="text-[10px] text-zinc-400">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                    <CreditCard size={18} className="text-zinc-400 shrink-0" />
                  </label>

                  {/* Cash On Delivery */}
                  <label className={`border p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "COD" ? "border-[#2563EB] bg-blue-50/20" : "border-zinc-100 hover:border-zinc-300"
                    }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment-option"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="border-zinc-300 text-black focus:ring-[#2563EB] w-4 h-4"
                      />
                      <div className="text-xs">
                        <p className="font-bold">Cash On Delivery (COD)</p>
                        <p className="text-[10px] text-zinc-400">Pay cash/card at door</p>
                      </div>
                    </div>
                    <Coins size={18} className="text-zinc-400 shrink-0" />
                  </label>

                </div>
              </div>

            </div>

            {/* Checkout items summary sidebar (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">

              {/* Bag items display */}
              <div className="border border-zinc-100 rounded-3xl p-6 bg-white">
                <h3 className="font-black text-xs uppercase tracking-wider mb-4 pb-2 border-b border-zinc-100">Your Bag Items</h3>

                <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2">
                  {activeItems.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3 text-xs">
                      <div className="w-12 h-12 bg-zinc-50 border rounded-lg overflow-hidden shrink-0">
                        <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold truncate">{item.product.name}</h5>
                        <p className="text-[10px] text-zinc-400 uppercase font-semibold">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold shrink-0">₹{item.product.sellingPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculations */}
              <div className="border border-zinc-100 rounded-3xl p-6 bg-zinc-50">
                <h3 className="font-black text-xs uppercase tracking-wider mb-4 pb-2 border-b border-zinc-200">Summary Payment</h3>

                <div className="flex flex-col gap-3 font-semibold text-xs text-zinc-500 mb-6">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="text-[#111111] font-extrabold">₹{subtotal}</span>
                  </div>
                  {checkoutCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount Coupon ({checkoutCoupon.code})</span>
                      <span className="font-extrabold">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST/Sales Tax (12%)</span>
                    <span className="text-[#111111] font-extrabold">₹{taxAmount}</span>
                  </div>
                  <hr className="border-zinc-200 my-1" />
                  <div className="flex justify-between text-sm font-black text-[#111111] uppercase">
                    <span>Total Amount Due</span>
                    <span className="text-black">₹{finalTotal}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
                    {error}
                  </div>
                )}

                {/* Place Order submit */}
                <button
                  type="submit"
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3.5  font-bold uppercase tracking-wider text-xs transition-colors text-center"
                >
                  Place Order (₹{finalTotal})
                </button>
              </div>

            </div>

          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-semibold text-zinc-500 mb-4">No active items in bag to checkout.</p>
            <Link href="/" className="bg-black text-white px-6 py-2.5  text-xs font-bold uppercase">
              Return to Homepage
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
