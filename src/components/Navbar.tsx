"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../app/context/AppContext";
import AuthModal from "./AuthModal";
import NavbarTopBar from "./NavbarTopBar";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  ShieldAlert, 
} from "lucide-react";

import { Category as NavbarCategory, Subcategory as NavbarSubcategory } from "@/types/category";

export default function Navbar() {
  const { cart, wishlist, currentUser, logoutUser } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<NavbarCategory[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const formatLabel = (value: string) => {
    if (!value) return value;
    return value.toUpperCase();
  };

  const activeCartCount = cart.filter(item => !item.savedForLater).reduce((acc, c) => acc + c.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    logoutUser();
    toast.success("Logout successful.");
    setProfileDropdownOpen(false);
    router.push("/");
  };

  const handleProtectedNav = (path: string) => {
    if (currentUser) {
      router.push(path);
      setProfileDropdownOpen(false);
      return;
    }

    openAuthModal("login");
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.get("/categories");
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const desktopCategories = useMemo(() => categories, [categories]);

  const mobileCategories = useMemo(() => categories, [categories]);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setActiveCategoryDropdown(null);
  };

  const buildCategoryHref = (categoryName: string, subcategoryName?: string) => {
    const params = new URLSearchParams();
    params.set("category", categoryName);
    if (subcategoryName) {
      params.set("subCategory", subcategoryName);
    }
    return `/products?${params.toString()}`;
  };

  return (
    <>
    <header className="z-50 w-full border-b border-zinc-100 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-black/95">
      {/* Top Banner Alert (Simulated Sales/Notice) */}
      <NavbarTopBar />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-black tracking-widest text-primary dark:text-white uppercase transition-all duration-300 hover:opacity-80">
            Athletica
          </Link>
        </div>

        {/* Desktop Menu - Categories */}
        <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide uppercase">
          {desktopCategories.map((category) => {
            const hasSubcategories = (category.subcategories || []).length > 0;

            if (!hasSubcategories) {
              return (
                <Link
                  key={category.id}
                  href={buildCategoryHref(category.name)}
                  className="text-zinc-700 underline-offset-4 transition-colors hover:text-accent hover:underline dark:text-zinc-300 dark:hover:text-white"
                >
                  {formatLabel(category.name)}
                </Link>
              );
            }

            return (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setActiveCategoryDropdown(category.id)}
                onMouseLeave={() => setActiveCategoryDropdown(null)}
              >
                <Link
                  href={buildCategoryHref(category.name)}
                  className="text-zinc-700 underline-offset-4 transition-colors hover:text-accent hover:underline dark:text-zinc-300 dark:hover:text-white"
                >
                  {category.name}
                </Link>
                {activeCategoryDropdown === category.id && (
                  <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-6">
                    <div className="bg-white px-8 py-7 text-left shadow-xl ring-1 ring-black/5">
                    <h3 className="mb-5 text-base font-bold normal-case tracking-normal text-black">
                      {formatLabel(category.name)}
                    </h3>
                    <div className="flex flex-col gap-4 normal-case tracking-normal">
                      {category.subcategories!.map((item) => (
                        <Link
                          key={item.id}
                          href={buildCategoryHref(category.name, item.name)}
                          onClick={() => setActiveCategoryDropdown(null)}
                          className="text-sm font-semibold text-zinc-600 underline-offset-4 transition-colors hover:text-black hover:underline"
                        >
                          {formatLabel(item.name)}
                        </Link>
                      ))}
                    </div>
                  </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Side - Search, Wishlist, Cart, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Bar Desktop */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 xl:w-60  border border-zinc-200 bg-zinc-50 px-4 py-1.5 pl-10 text-xs font-medium text-primary transition-all focus:border-primary  focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-white"
            />
            <Search className="absolute left-3.5 top-2.5 text-zinc-400 dark:text-zinc-500" size={13} />
          </form>

          {/* Wishlist Icon */}
          <Link href="/wishlist" className="relative p-2 text-zinc-700 hover:text-accent dark:text-zinc-300 dark:hover:text-white transition-colors" title="Wishlist">
            <Heart size={20} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white dark:bg-white dark:text-black">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 text-zinc-700 hover:text-accent dark:text-zinc-300 dark:hover:text-white transition-colors" title="Shopping Cart">
            <ShoppingBag size={20} />
            {activeCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {activeCartCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-1 p-2 text-zinc-700 hover:text-accent dark:text-zinc-300 dark:hover:text-white transition-colors focus:outline-none"
              title="Profile Options"
            >
              <UserIcon size={20} />
              {currentUser && (
                <span className="hidden sm:inline text-xs font-semibold max-w-20 truncate">
                  {currentUser.name.split(" ")[0]}
                </span>
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white px-5 py-5 shadow-xl ring-1 ring-black/10">
                <span className="absolute -top-2 right-9 h-4 w-4 rotate-45 bg-white" />
                <div className="relative space-y-0 text-[15px] font-medium text-black">
                  {currentUser?.role === "admin" || currentUser?.role === "super_admin" ? (
                    <button
                      type="button"
                      onClick={() => {
                        router.push("/admin");
                        setProfileDropdownOpen(false);
                      }}
                      className="block w-full border-b border-zinc-200 py-3 text-left hover:text-accent"
                    >
                      Admin Dashboard
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleProtectedNav("/profile")}
                        className="block w-full border-b border-zinc-200 py-3 text-left hover:text-accent"
                      >
                        My Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProtectedNav("/wishlist")}
                        className="block w-full border-b border-zinc-200 py-3 text-left hover:text-accent"
                      >
                        Wishlist
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProtectedNav("/profile")}
                        className="block w-full border-b border-zinc-200 py-3 text-left hover:text-accent"
                      >
                        My Order
                      </button>
                    </>
                  )}
                  <div className="space-y-2 pt-5">
                    {currentUser ? (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="h-12 w-full bg-[#1f1f1f] text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-black"
                      >
                        Logout
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openAuthModal("login")}
                          className="h-12 w-full bg-[#1f1f1f] text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-black"
                        >
                          Login
                        </button>
                        <button
                          type="button"
                          onClick={() => openAuthModal("register")}
                          className="h-12 w-full border border-zinc-500 bg-white text-sm font-black uppercase tracking-wide text-black transition-colors hover:border-black hover:bg-zinc-50"
                        >
                          Register
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-700 hover:text-accent dark:text-zinc-300 dark:hover:text-white md:hidden"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 py-4 md:hidden dark:border-zinc-800 dark:bg-black">
          <nav className="flex flex-col space-y-3 font-semibold uppercase text-sm tracking-wider">
            {mobileCategories.map((category) => (
              <div key={category.id} className="space-y-2">
                <Link
                  href={buildCategoryHref(category.name)}
                  onClick={closeMenus}
                  className="py-1 text-zinc-800 hover:text-accent dark:text-zinc-200"
                >
                  {formatLabel(category.name)}
                </Link>
                {(category.subcategories || []).length > 0 && (
                  <div className="flex flex-col pl-4 space-y-2 border-l border-zinc-100 dark:border-zinc-800">
                    {category.subcategories!.map((item) => (
                      <Link
                        key={item.id}
                        href={buildCategoryHref(category.name, item.name)}
                        onClick={closeMenus}
                        className="py-1 text-zinc-600 hover:text-accent dark:text-zinc-400"
                      >
                        {formatLabel(item.name)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Search form mobile */}
            <form onSubmit={handleSearchSubmit} className="relative py-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 pl-10 text-xs font-medium text-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              />
              <Search className="absolute left-3.5 top-4.5 text-zinc-400" size={13} />
            </form>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />

            {currentUser?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-accent text-white py-2 rounded-xl text-center text-xs font-bold hover:bg-blue-700 transition-colors uppercase tracking-wider"
              >
                <ShieldAlert size={14} />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
    {authModalOpen && (
      <AuthModal
        mode={authModalMode}
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onModeChange={setAuthModalMode}
      />
    )}
    </>
  );
}
