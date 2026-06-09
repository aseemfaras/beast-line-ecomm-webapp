"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Plus,
  Check
} from "lucide-react";
import { ProductDetailProps } from "@/types/product";


export default function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    products,
    reviews,
    wishlist,
    toggleWishlist,
    addToCart,
    addReview,
    currentUser,
    productsLoading
  } = useApp();

  // Find current product
  const product = useMemo(() => {
    return products.find((p) => p.id === id);
  }, [products, id]);

  const productImages = useMemo(() => {
    if (!product) return [];
    return [product.thumbnail, ...product.gallery].filter(
      (img): img is string => typeof img === "string" && img.trim().length > 0
    );
  }, [product]);

  // Gallery active image
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const currentImage =
    activeImage && productImages.includes(activeImage) ? activeImage : (productImages[0] ?? null);

  // Zoom overlay coordinates
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Selected Variants
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const currentSelectedColor =
    product && selectedColor && product.colors.includes(selectedColor)
      ? selectedColor
      : (product?.colors[0] ?? "");
  const currentSelectedSize =
    product && selectedSize && product.sizes.includes(selectedSize)
      ? selectedSize
      : (product?.sizes[0] ?? "");

  // Details Tab
  const [activeTab, setActiveTab] = useState("details");

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);

  if (productsLoading) return <Loader />;

  if (!product) {
    return (
      <div className="w-full bg-white text-black dark:bg-white dark:text-black min-h-screen flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-2xl font-black uppercase text-red-600 mb-4">Product Not Found</h2>
        <Link href="/products" className="bg-black text-white px-6 py-3 rounded-xl font-bold uppercase text-xs">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Filter reviews
  const approvedReviews = reviews.filter((r) => r.productId === product.id && r.status === "approved");
  const pendingReviewsCount = reviews.filter((r) => r.productId === product.id && r.status === "pending" && r.userName === currentUser?.name).length;
  const ownRejectedReviews = reviews.filter((r) => r.productId === product.id && r.status === "rejected" && currentUser && r.userId === currentUser.id);

  // Recommendations (related by sport/category)
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.sportType === product.sportType || p.category === product.category))
    .slice(0, 4);

  // Frequently Bought Together Bundle: (Current product + another accessory)
  const bundleProduct = products.find((p) => p.id !== product.id && p.category === "Accessories") || products[0];

  const handleAddToCart = () => {
    addToCart(product, currentSelectedSize, currentSelectedColor, 1);
    toast.success("Added to cart.");
  };

  const handleBuyNow = () => {
    addToCart(product, currentSelectedSize, currentSelectedColor, 1);
    toast.success("Added to cart.");
    router.push("/cart");
  };

  const handleBundleAdd = () => {
    // Add both items to cart
    addToCart(product, currentSelectedSize, currentSelectedColor, 1);
    const bundleSize = bundleProduct.sizes[0] || "M";
    const bundleColor = bundleProduct.colors[0] || "Default";
    addToCart(bundleProduct, bundleSize, bundleColor, 1);
    setBundleAdded(true);
    toast.success("Bundle added to cart.");
    setTimeout(() => setBundleAdded(false), 3000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    if (reviewComment.trim()) {
      addReview(product.id, reviewRating, reviewComment);
      setReviewComment("");
      setReviewSubmitted(true);
    }
  };

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="w-full bg-white text-black dark:bg-white dark:text-black min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight size={10} />
          <Link href="/products" className="hover:text-black">Products</Link>
          <ChevronRight size={10} />
          <span className="text-[#111111] truncate max-w-[150px]">{product.name}</span>
        </nav>

        {/* Main product visual + details panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">

            {/* Main Display Image with Premium Coordinates Zoom */}
            <div
              className="flex-1 aspect-square bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden relative cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center absolute inset-0 transition-transform duration-75"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZooming ? "scale(1.8)" : "scale(1)"
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  No image available
                </div>
              )}
              {product.discount > 0 && (
                <span className="absolute left-4 top-4 bg-[#2563EB] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider z-10">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail track (Vertical or horizontal) */}
            <div className="flex md:flex-col gap-3 justify-start overflow-x-auto md:overflow-x-visible">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 bg-zinc-50 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${currentImage === img ? "border-[#2563EB]" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Checkout Configurator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-2">
                <span>{product.brand} • {product.sportType}</span>
                <span className="flex items-center gap-0.5 text-yellow-500">
                  <Star size={13} className="fill-yellow-500" />
                  <span className="text-[#111111] ml-1">{product.rating}</span>
                  <span className="text-zinc-400">({approvedReviews.length})</span>
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111111] mb-2 leading-tight">
                {product.name}
              </h1>

              <p className="text-sm text-zinc-500 font-medium mb-4">
                {product.shortDescription}
              </p>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-black">
                  ₹{product.sellingPrice}
                </span>
                {product.mrp > product.sellingPrice && (
                  <>
                    <span className="text-base text-zinc-400 line-through font-semibold">
                      ₹{product.mrp}
                    </span>
                    {/* <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                      Save ${product.mrp - product.sellingPrice}
                    </span> */}
                  </>
                )}
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Color Selector */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Select Color: <span className="text-[#111111]">{currentSelectedColor}</span></h4>
              <div className="flex gap-2.5">
                {product.colors.map((color) => {
                  const active = currentSelectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border text-xs font-bold transition-all ${active
                        ? "bg-[#111111] text-white border-black"
                        : "border-zinc-200 text-zinc-700 hover:border-black"
                        }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Select Size: <span className="text-[#111111]">{currentSelectedSize}</span></h4>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const active = currentSelectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border py-2 text-xs font-bold transition-all ${active
                        ? "bg-[#111111] text-white border-black"
                        : "border-zinc-200 text-zinc-700 hover:border-black"
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-white hover:bg-zinc-50 text-[#111111] border-2 border-[#111111] py-3.5  font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={15} />
                {product.stock === 0 ? "Out of Stock" : "Add To Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-[#111111] hover:bg-[#2563EB] text-white py-3.5  font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                Buy Now
              </button>

              {/* Wishlist button */}
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(isWishlisted ? "Removed from wishlist." : "Added to wishlist.");
                }}
                className={`p-3.5 border  transition-all ${isWishlisted
                  ? "border-red-200 bg-red-50/50 text-red-500"
                  : "border-zinc-200 text-zinc-500 hover:border-black"
                  }`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={16} className={isWishlisted ? "fill-red-500" : ""} />
              </button>
            </div>

            {/* Value delivery items */}
            <div className=" p-4 rounded-2xl flex flex-col gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-2 text-zinc-600">
                <Truck size={14} className="text-[#2563EB]" />
                <span>Standard delivery in 2-4 days (Free over $50)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <RefreshCw size={14} className="text-[#2563EB]" />
                <span>30 Days Free Return Policy</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <ShieldCheck size={14} className="text-[#2563EB]" />
                <span>1 Year Warranty & 100% Original Brand Assured</span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabs Layout: Details, Shipping, Returns */}
        <section className="mb-16">
          <div className="flex border-b border-zinc-100 mb-6 text-sm font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 pr-6 border-b-2 transition-all ${activeTab === "details" ? "border-black text-black" : "border-transparent text-zinc-400 hover:text-black"
                }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 px-6 border-b-2 transition-all ${activeTab === "shipping" ? "border-black text-black" : "border-transparent text-zinc-400 hover:text-black"
                }`}
            >
              Shipping Info
            </button>
            <button
              onClick={() => setActiveTab("returns")}
              className={`pb-3 px-6 border-b-2 transition-all ${activeTab === "returns" ? "border-black text-black" : "border-transparent text-zinc-400 hover:text-black"
                }`}
            >
              Return Policy
            </button>
          </div>

          <div className="text-zinc-600 text-xs leading-relaxed max-w-4xl">
            {activeTab === "details" && (
              <div className="flex flex-col gap-4">
                <p>{product.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 border border-zinc-100 p-4 rounded-xl">
                  <div>
                    <h6 className="font-bold text-zinc-400 uppercase text-[10px] mb-0.5">SKU Code</h6>
                    <p className="text-sm font-bold text-[#111111]">{product.sku}</p>
                  </div>
                  <div>
                    <h6 className="font-bold text-zinc-400 uppercase text-[10px] mb-0.5">Brand</h6>
                    <p className="text-sm font-bold text-[#111111]">{product.brand}</p>
                  </div>
                  <div>
                    <h6 className="font-bold text-zinc-400 uppercase text-[10px] mb-0.5">Sport Style</h6>
                    <p className="text-sm font-bold text-[#111111]">{product.sportType}</p>
                  </div>
                  <div>
                    {/* <h6 className="font-bold text-zinc-400 uppercase text-[10px] mb-0.5">Stock Status</h6>
                    <p className={`text-sm font-bold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {product.stock > 0 ? `${product.stock} Available` : "Out of Stock"}
                    </p> */}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "shipping" && (
              <p>
                Athletica offers standard ground shipping to all locations. Orders placed by 3:00 PM EST ship same-day. Shipping is free for orders totaling $50 or more (before tax and after discount coupons have been applied). For expedited options, check our premium delivery services at checkout.
              </p>
            )}
            {activeTab === "returns" && (
              <p>
                We want you to love your performance gear. If you are not fully satisfied, you may initiate a return or size exchange request within 30 days of delivery. Return items must be unworn, undamaged, with original tags intact, and submitted in their original product box. Return refunds are processed client-side within 3 working days once approved by admin.
              </p>
            )}
          </div>
        </section>

        {/* Frequently Bought Together Bundle Offer */}
        {/* <section className="mb-16 bg-zinc-50 border border-zinc-100 rounded-3xl p-6 md:p-8">
          <h3 className="text-lg font-black uppercase text-[#111111] mb-6">Frequently Bought Together</h3>
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">

            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                  <img src={product.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="font-bold text-xs max-w-[150px] truncate">{product.name}</h5>
                  <p className="text-xs font-semibold text-zinc-500">${product.sellingPrice}</p>
                </div>
              </div>

              <Plus className="text-zinc-400 shrink-0" size={16} />

              
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                  <img src={bundleProduct.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 className="font-bold text-xs max-w-[150px] truncate">{bundleProduct.name}</h5>
                  <p className="text-xs font-semibold text-zinc-500">${bundleProduct.sellingPrice}</p>
                </div>
              </div>
            </div>

            
            <div className="text-center md:text-right flex flex-col md:flex-row items-center gap-4">
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bundle price</p>
                <p className="text-xl font-black text-[#2563EB]">${product.sellingPrice + bundleProduct.sellingPrice}</p>
              </div>
              <button
                onClick={handleBundleAdd}
                className={`px-6 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center gap-1.5 ${bundleAdded ? "bg-green-600 text-white" : "bg-[#111111] hover:bg-zinc-800 text-white"
                  }`}
              >
                {bundleAdded ? <Check size={14} /> : <Plus size={14} />}
                {bundleAdded ? "Bundle Added!" : "Add Both To Cart"}
              </button>
            </div>

          </div>
        </section> */}

        {/* Reviews Section */}
        <section className="mb-16">
          <div className="border-b border-zinc-100 pb-4 mb-6 flex justify-between items-baseline">
            <h3 className="text-xl font-black uppercase text-[#111111]">Customer Reviews</h3>
            <span className="text-xs text-zinc-500 font-semibold">{approvedReviews.length} Approved Reviews</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Reviews list (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {approvedReviews.length > 0 ? (
                approvedReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-zinc-50 pb-6 last:border-none">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-[#111111]">{rev.userName}</span>
                      <span className="text-[10px] font-semibold text-zinc-400">{rev.date}</span>
                    </div>

                    <div className="flex gap-0.5 text-yellow-500 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-300"}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">No approved reviews yet. Write a review to share your experience!</p>
              )}

              {pendingReviewsCount > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-[#2563EB] font-medium">
                  You have {pendingReviewsCount} review(s) pending moderation approval by admin. They will appear once approved.
                </div>
              )}

              {ownRejectedReviews.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <p className="text-xs font-bold text-red-600 uppercase">Your Rejected Reviews (only visible to you)</p>
                  {ownRejectedReviews.map((rev) => (
                    <div key={rev.id} className="border border-red-200 bg-red-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-black">Your Review</span>
                        <span className="text-[10px] font-semibold text-zinc-400">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5 text-yellow-500 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-300"}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-3">{rev.comment}</p>
                      <div className="bg-white border border-red-200 p-3 rounded-lg">
                        <p className="text-[9px] font-bold text-red-600 uppercase mb-0.5">Rejected by Admin</p>
                        <p className="text-[10px] text-red-500 leading-relaxed">{rev.rejectReason || "No reason provided."}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a review Form (4 cols) */}
            <div className="lg:col-span-4 bg-zinc-50 p-6 rounded-2xl">
              <h4 className="font-black text-xs uppercase tracking-wider mb-4">Write A Review</h4>

              {reviewSubmitted ? (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <Check className="text-green-600 bg-green-50 p-2.5 rounded-full" size={40} />
                  <h5 className="font-bold text-xs uppercase">Review Submitted</h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Thank you! Your feedback has been queued. It will appear on this page once approved by our moderation team.
                  </p>
                  <button
                    onClick={() => setReviewSubmitted(false)}
                    className="text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Write another review
                  </button>
                </div>
              ) : currentUser ? (
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">

                  {/* Stars selector */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Rating</label>
                    <div className="flex gap-1.5 text-yellow-500">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setReviewRating(val)}
                          className="hover:scale-110 transition-transform focus:outline-none"
                          title={`${val} Stars`}
                        >
                          <Star
                            size={18}
                            className={val <= reviewRating ? "fill-yellow-500" : "text-zinc-300"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review comments */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe product sizing, fit, material quality, performance, etc."
                      className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs focus:border-black focus:outline-none"
                    />
                  </div>

                  {/* Upload placeholder */}
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Upload Images (Mock)</span>
                    <div className="border border-dashed border-zinc-300 rounded-xl p-3 text-center text-[10px] text-zinc-400">
                      Click to drag and drop photo
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-black text-white hover:bg-zinc-800 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Submit Review
                  </button>

                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-500 mb-4">Please log in to write a review for this product.</p>
                  <Link
                    href="/auth/login"
                    className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider inline-block"
                  >
                    Log In
                  </Link>
                </div>
              )}

            </div>

          </div>
        </section>

        {/* Recommended related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-zinc-100 pt-16">
            <h3 className="text-xl font-black uppercase text-[#111111] mb-8">Related Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
