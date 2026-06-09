"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { ShieldCheck, Mail, Lock, UserIcon, Phone, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { registerUser, currentUser } = useApp();
  const router = useRouter();
  const authFlowRef = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser && !authFlowRef.current) {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    authFlowRef.current = true;

    try {
      const res = await registerUser(name, email, mobile, password);
      setLoading(false);
      if (res.success) {
        setSuccessPopup(true);
        toast.success("Account created successfully.");
        setTimeout(() => {
          router.push("/");
        }, 1200);
      } else {
        authFlowRef.current = false;
        setError(res.error || "Registration failed.");
      }
    } catch (err: unknown) {
      setLoading(false);
      authFlowRef.current = false;
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      {successPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] dark:bg-blue-950/30">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-black uppercase text-[#111111]">
              Account Created
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
          <h2 className="text-2xl font-black uppercase text-[#111111] mt-3">Join Athletica</h2>
          <p className="text-[11px] text-zinc-400 font-semibold tracking-wide uppercase mt-1">Unlock your performance tracking</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-600 font-semibold text-xs mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          
          {/* Name */}
          <div className="relative">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-black bg-white px-4 py-2.5 pl-10 text-xs font-semibold text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none"
              />
              <UserIcon className="absolute left-3.5 top-3.5 text-zinc-400" size={14} />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-xl border border-black bg-white px-4 py-2.5 pl-10 text-xs font-semibold text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none"
              />
              <Mail className="absolute left-3.5 top-3.5 text-zinc-400" size={14} />
            </div>
          </div>

          {/* Mobile */}
          <div className="relative">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Mobile Phone</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+1 999 888 7777"
                className="w-full rounded-xl border border-black bg-white px-4 py-2.5 pl-10 text-xs font-semibold text-black placeholder:text-zinc-400 focus:border-black focus:bg-white focus:outline-none"
              />
              <Phone className="absolute left-3.5 top-3.5 text-zinc-400" size={14} />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Secure Password</label>
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
            className="bg-[#111111] hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Registering..." : "Create Account"}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-400 font-semibold">
          Already an Athletica member?{" "}
          <Link href="/auth/login" className="text-[#2563EB] hover:underline font-bold">
            Sign In Instead
          </Link>
        </div>

        </div>
      </div>
  );
}
