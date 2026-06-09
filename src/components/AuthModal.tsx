"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

import { AuthMode, AuthModalProps } from "@/types/auth";

export default function AuthModal({ mode, open, onClose, onModeChange }: AuthModalProps) {
  const { loginUser, registerUser } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res =
        mode === "login"
          ? await loginUser(email, password)
          : await registerUser(name, email, mobile, password);

      setLoading(false);
      if (res.success) {
        const successMessage = mode === "login" ? "Login successful." : "Account created successfully.";
        setSuccess(successMessage);
        toast.success(successMessage);
        setTimeout(() => {
          onClose();
          if (mode === "login" && (res.user?.role === "admin" || res.user?.role === "super_admin")) {
            router.push("/admin");
          }
        }, 1200);
      } else {
        setError(res.error || (mode === "login" ? "Authentication failed." : "Registration failed."));
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : mode === "login"
            ? "Authentication failed."
            : "Registration failed."
      );
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 px-4 py-6 text-black sm:py-10">
      <div className="relative mx-auto w-full max-w-[420px] bg-white px-5 py-6 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-5 text-zinc-500 transition-colors hover:text-black"
          aria-label="Close authentication popup"
        >
          <X size={20} strokeWidth={1.3} />
        </button>

        <h2 className="mb-6 text-2xl font-bold leading-none text-[#111111]">
          {isLogin ? "Log In" : "Register"}
        </h2>

        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-semibold text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-2 text-sm text-black">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="h-12 w-full border border-zinc-300 px-5 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black"
              />
            </div>
          )}

          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-2 text-sm text-black">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 w-full border border-zinc-300 px-5 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black"
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-2 text-sm text-black">
                Mobile Phone *
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
                className="h-12 w-full border border-zinc-300 px-5 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black"
              />
            </div>
          )}

          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-2 text-sm text-black">
              Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? "Enter your password" : "Create your password"}
              className="h-12 w-full border border-zinc-300 px-5 pr-16 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {isLogin && (
            <button
              type="button"
              className="block w-full text-right text-xs text-black hover:underline"
            >
              Forgot Password?
            </button>
          )}

          <p className="mx-auto max-w-[340px] text-center text-xs leading-6 text-zinc-700">
            By {isLogin ? "logging in" : "registering"}, you agree to the{" "}
            <span className="underline">Terms & Conditions</span> and{" "}
            <span className="underline">Privacy Policy</span>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#1f1f1f] text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {loading ? (isLogin ? "Signing In..." : "Creating Account...") : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-7 text-center text-xs text-black">
          {isLogin ? "New to Athletica?" : "Already an Athletica member?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowPassword(false);
              onModeChange(isLogin ? "register" : "login");
            }}
            className="font-bold hover:underline"
          >
            {isLogin ? "Register" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
