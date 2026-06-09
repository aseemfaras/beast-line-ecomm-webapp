import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "./context/AppContext";
import ToastProvider from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Athletica Sportswear - Premium Athletic Apparel & Shoes",
  description: "High-performance sportswear, activewear, and athletic shoes engineered for athletes. Experience peak training comfort with Athletica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-[#111111] dark:text-zinc-50">
        <AppContextProvider>
          {children}
          <ToastProvider />
        </AppContextProvider>
      </body>
    </html>
  );
}
