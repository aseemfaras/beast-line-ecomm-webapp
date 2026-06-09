"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Loader from "@/components/Loader";
import { 
  Users as UsersIcon, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  Plus
} from "lucide-react";

const parseOrderDate = (value: string) => {
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const normalized = value.replace(/,\s*/, " ");
  const fallback = new Date(normalized);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatChartLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminDashboardPage() {
  const { products, orders, users, productsLoading, ordersLoading, usersLoading } = useApp();

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const totalOrders = orders.length;
    
    // Revenue from successfully paid/confirmed orders
    const revenue = orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const totalProducts = products.length;

    // Inventory warning counts
    const lowStockCount = products.filter(
      p => p.stock <= p.minStock && p.stock > 0
    ).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return {
      totalUsers,
      totalOrders,
      revenue,
      totalProducts,
      lowStockCount,
      outOfStockCount
    };
  }, [products, orders, users]);

  // SVG Chart Calculations - Daily Sales (past 7 days)
  const salesHistory = useMemo(() => {
    const today = new Date();
    const dayBuckets = Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - idx));
      return {
        key: toLocalDateKey(date),
        date,
        dateLabel: formatChartLabel(date),
        amount: 0,
      };
    });

    const bucketMap = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]));

    orders.forEach((order) => {
      if (order.status === "Cancelled") return;
      const parsedDate = parseOrderDate(order.date);
      if (!parsedDate) return;

      const key = toLocalDateKey(parsedDate);
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.amount += order.total;
      }
    });

    const dailySales = dayBuckets.map(({ dateLabel, amount }) => ({
      date: dateLabel,
      amount,
    }));

    const maxAmt = Math.max(...dailySales.map(d => d.amount), 1);
    const height = 150;
    const width = 500;
    const padding = 20;

    const points = dailySales.map((d, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (dailySales.length - 1);
      const y = height - padding - (d.amount / maxAmt) * (height - padding * 2);
      return { x, y, ...d };
    });

    const pathD = points.reduce(
      (path, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`),
      ""
    );

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { points, pathD, areaD, height, width, list: dailySales };
  }, [orders]);

  const monthlyRevenueHistory = useMemo(() => {
    const today = new Date();
    const monthBuckets = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - idx), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: formatMonthLabel(date),
        amount: 0,
      };
    });

    const bucketMap = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));

    orders.forEach((order) => {
      if (order.status === "Cancelled") return;
      const parsedDate = parseOrderDate(order.date);
      if (!parsedDate) return;

      const key = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.amount += order.total;
      }
    });

    const maxValue = Math.max(...monthBuckets.map((bucket) => bucket.amount), 1);

    return monthBuckets.map((bucket) => ({
      label: bucket.label,
      amount: bucket.amount,
      height: (bucket.amount / maxValue) * 100,
    }));
  }, [orders]);

  const grossRevenueTrend = useMemo(() => {
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - 6);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);

    const currentWeekRevenue = orders.reduce((sum, order) => {
      if (order.status === "Cancelled") return sum;
      const parsedDate = parseOrderDate(order.date);
      if (!parsedDate || parsedDate < startOfCurrentWeek) return sum;
      return sum + order.total;
    }, 0);

    const previousWeekRevenue = orders.reduce((sum, order) => {
      if (order.status === "Cancelled") return sum;
      const parsedDate = parseOrderDate(order.date);
      if (!parsedDate || parsedDate < startOfPreviousWeek || parsedDate >= startOfCurrentWeek) {
        return sum;
      }
      return sum + order.total;
    }, 0);

    const change =
      previousWeekRevenue > 0
        ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
        : currentWeekRevenue > 0
          ? 100
          : 0;

    return {
      revenue: metrics.revenue,
      change,
    };
  }, [metrics.revenue, orders]);

  if (productsLoading || ordersLoading || usersLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-8 bg-white text-black">
      
      {/* 1. Metric Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Metric */}
        <div className="border border-gray-300 rounded-xl p-6 bg-white flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">Gross Revenue</span>
            <span className="text-2xl font-black text-black">{formatCurrency(grossRevenueTrend.revenue)}</span>
            <span className="text-[10px] text-green-600 font-semibold tracking-wide flex items-center gap-1 uppercase">
              <TrendingUp size={12} /> {grossRevenueTrend.change >= 0 ? "+" : ""}{grossRevenueTrend.change.toFixed(1)}% vs last week
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-[#2563EB] rounded-full shrink-0">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Orders Metric */}
        <div className="border border-gray-300 rounded-xl p-6 bg-white flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">Total Orders</span>
            <span className="text-2xl font-black text-black">{metrics.totalOrders}</span>
            <span className="text-[10px] text-black font-semibold tracking-wide uppercase">
              Simulated billing transactions
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-[#2563EB] rounded-full shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Users Metric */}
        <div className="border border-gray-300 rounded-xl p-6 bg-white flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">Active Accounts</span>
            <span className="text-2xl font-black text-black">{metrics.totalUsers}</span>
            <span className="text-[10px] text-black font-semibold tracking-wide uppercase">
              Customers & moderators
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-[#2563EB] rounded-full shrink-0">
            <UsersIcon size={20} />
          </div>
        </div>

        {/* Inventory Warnings Metric */}
        <div className="border border-gray-300 rounded-xl p-6 bg-white flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">Inventory Alerts</span>
            <span className="text-2xl font-black text-red-600">{metrics.outOfStockCount + metrics.lowStockCount}</span>
            <span className="text-[10px] font-bold text-black uppercase flex items-center gap-1">
              <AlertTriangle size={11} className="text-amber-500" />
              <span>{metrics.outOfStockCount} OOS | {metrics.lowStockCount} Low</span>
            </span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
            <AlertTriangle size={20} />
          </div>
        </div>

      </section>

      {/* 2. Charts section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Custom SVG Line Chart - Daily Sales */}
        <div className="border border-gray-300 rounded-xl p-6 bg-white">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-black">Daily Sales Curve</h3>
            <span className="text-[10px] font-bold text-[#2563EB] uppercase">Past 7 Days</span>
          </div>
          
          <div className="w-full relative aspect-[2/1] min-h-[160px] flex items-center justify-center">
            <svg 
              viewBox={`0 0 ${salesHistory.width} ${salesHistory.height}`} 
              className="w-full h-full text-[#2563EB]"
            >
              {/* Grids */}
              <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="75" x2="480" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="130" x2="480" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
              
              {/* Area Gradient */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={salesHistory.areaD} fill="url(#chartGrad)" />
              
              {/* Plot Path Line */}
              <path 
                d={salesHistory.pathD} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              
              {/* Coordinate Plot dots */}
              {salesHistory.points.map((pt, idx) => (
                <circle 
                  key={idx} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="4.5" 
                  fill="#ffffff" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  className="cursor-pointer hover:r-6 hover:stroke-black transition-all"
                />
              ))}
            </svg>
          </div>

          <div className="flex justify-between text-[9px] font-bold text-black uppercase mt-4 px-2">
            {salesHistory.points.map((pt, idx) => (
              <span key={idx} className="text-center w-10">
                <p>{pt.date}</p>
                <p className="text-black font-extrabold mt-0.5">₹{pt.amount}</p>
              </span>
            ))}
          </div>
        </div>

        {/* Custom SVG Bar Chart - Monthly Performance */}
        <div className="border border-gray-300 rounded-xl p-6 bg-white">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-black">Monthly Revenue Trends</h3>
            <span className="text-[10px] font-bold text-[#2563EB] uppercase">Past 6 Months</span>
          </div>

          <div className="w-full relative aspect-[2/1] min-h-[160px] flex items-end justify-between px-2 pt-4">
            {monthlyRevenueHistory.map((bar, idx) => {
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-8 sm:w-12 bg-zinc-100 hover:bg-[#2563EB] rounded-t-lg transition-all duration-500 relative group" style={{ height: `${bar.height}%` }}>
                    {/* Hover Value Tooltip */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-black border border-zinc-200 px-2 py-0.5 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      ₹{bar.amount}
                    </span>
                  </div>
                  <span className="text-[10px] text-black font-bold uppercase">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* 3. Recent Activity & Fast actions Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders table (7 cols) */}
        <div className="lg:col-span-8 border border-gray-300 rounded-xl p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xs uppercase tracking-wider text-black">Recent Orders Placed</h3>
            <Link 
              href="/admin/orders" 
              className="text-[10px] font-bold text-[#2563EB] hover:text-blue-700 uppercase tracking-wider flex items-center gap-0.5"
            >
              All Orders <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto text-xs">
            {orders.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-black font-bold uppercase text-[10px]">
                    <th className="pb-3 font-bold">Order ID</th>
                    <th className="pb-3 font-bold">Customer</th>
                    <th className="pb-3 font-bold">Amount</th>
                    <th className="pb-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 4).map((o) => (
                    <tr key={o.id} className="border-b border-zinc-50 last:border-none">
                      <td className="py-4 font-bold text-black">{o.id}</td>
                      <td className="py-4 font-semibold text-black">{o.customerName}</td>
                      <td className="py-4 font-bold text-black">₹{o.total}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          o.status === "Delivered" ? "bg-green-50 text-green-700" :
                          o.status === "Cancelled" ? "bg-red-50 text-red-700" :
                          "bg-blue-50 text-blue-700"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="italic text-black py-4">No transactions found.</p>
            )}
          </div>
        </div>

        {/* Quick Admin Actions Panel (4 cols) */}
        <div className="lg:col-span-4 border border-gray-300 rounded-xl p-6 bg-white">
          <h3 className="font-black text-xs uppercase tracking-wider text-black mb-6">Quick Admin Actions</h3>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/products?action=new"
              className="flex items-center justify-between p-3.5 border border-zinc-100 hover:border-black rounded-xl transition-all font-bold text-xs uppercase text-black"
            >
              <span>Add New Product</span>
              <Plus size={14} className="text-[#2563EB]" />
            </Link>
            
            <Link
              href="/admin/coupons"
              className="flex items-center justify-between p-3.5 border border-zinc-100 hover:border-black rounded-xl transition-all font-bold text-xs uppercase text-black"
            >
              <span>Manage Coupons</span>
              <Plus size={14} className="text-[#2563EB]" />
            </Link>

            <Link
              href="/admin/inventory"
              className="flex items-center justify-between p-3.5 border border-zinc-100 hover:border-black rounded-xl transition-all font-bold text-xs uppercase text-black"
            >
              <span>Restock Inventory</span>
              <Plus size={14} className="text-[#2563EB]" />
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
}
