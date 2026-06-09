"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = pathname === "/auth/login" || pathname === "/auth/register";

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#111111] dark:bg-black dark:text-zinc-50">
      {!hideChrome && <Navbar />}
      <main className="flex-1 w-full">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}
