import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#111111]">
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
