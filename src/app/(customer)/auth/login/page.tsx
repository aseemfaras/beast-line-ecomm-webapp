"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { loginUser, currentUser } = useApp();
  const router = useRouter();
  const authFlowRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotAlert, setForgotAlert] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser && !authFlowRef.current) {
      router.push(currentUser.role === "admin" || currentUser.role === "super_admin" ? "/admin" : "/");
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    authFlowRef.current = true;

    try {
      const res = await loginUser(email, password);
      setLoading(false);
      if (res.success) {
        setSuccessPopup(true);
        toast.success("Login successful.");
        setTimeout(() => {
          router.push(res.user?.role === "admin" || res.user?.role === "super_admin" ? "/admin" : "/");
        }, 1200);
      } else {
        authFlowRef.current = false;
        setError(res.error || "Authentication failed.");
      }
    } catch (err: unknown) {
      setLoading(false);
      authFlowRef.current = false;
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotAlert(true);
    setTimeout(() => setForgotAlert(false), 5000);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      {successPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] dark:bg-blue-950/30">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-black uppercase text-[#111111]">
              Login Successful
            </h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Redirecting to your account
            </p>
          </div>
        </div>
      )}
      <div className="border border-black rounded-3xl p-8 bg-white text-black">
        
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-black tracking-widest uppercase text-[#111111]">
            ATHLETICA
          </Link>
          <h2 className="text-2xl font-black uppercase text-[#111111] mt-3">Welcome Back</h2>
          <p className="text-[11px] text-zinc-400 font-semibold tracking-wide uppercase mt-1">Access your performance portal</p>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-600 font-semibold text-xs mb-6">
            {error}
          </div>
        )}

        {forgotAlert && (
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-[#2563EB] font-semibold text-xs mb-6">
            A password reset link has been dispatched to your email address (simulated).
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          
          {/* Email */}
          <div className="relative">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-black bg-white px-4 py-2.5 pl-10 text-xs font-semibold text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none"
              />
              <Mail className="absolute left-3.5 top-3.5 text-zinc-400" size={14} />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={handleForgotSubmit}
                className="text-[10px] font-bold text-[#2563EB] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black bg-white px-4 py-2.5 pl-10 text-xs font-semibold text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none"
              />
              <Lock className="absolute left-3.5 top-3.5 text-zinc-400" size={14} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#111111] hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-400 font-semibold">
          Don&apos;t have an Athletica account?{" "}
          <Link href="/auth/register" className="text-[#2563EB] hover:underline font-bold">
            Sign Up Now
          </Link>
        </div>

        </div>
      </div>
  );
}
