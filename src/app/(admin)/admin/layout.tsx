"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import AdminSidebar from "../../../components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useApp();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait a tick for the profile to load from the token in localStorage
    const timer = setTimeout(() => setChecked(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (checked && (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "super_admin"))) {
      router.push("/");
    }
  }, [currentUser, router, checked]);

  if (!checked || !currentUser || (currentUser.role !== "admin" && currentUser.role !== "super_admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-xs font-bold uppercase tracking-wider text-black animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-black">
      
      {/* Sidebar Navigation */}
      <AdminSidebar />
      
      {/* Main Content viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Admin Header Top Bar */}
        <header className="h-16 border-b border-zinc-200/60 bg-white backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-black">Admin Dashboard</h2>
            <p className="text-[10px] text-black font-semibold uppercase">Real-time Sportswear Business Analytics</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-black">
            <span className="hidden sm:inline uppercase text-[10px] tracking-wider text-black font-bold bg-zinc-150 px-2.5 py-1 rounded-lg">System Online</span>
            <span>Welcome, Administrator</span>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-white p-8">{children}</main>

      </div>

    </div>
  );
}
