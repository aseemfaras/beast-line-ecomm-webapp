"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context/AppContext";
import Loader from "@/components/Loader";
import { Search, UserX, UserCheck, BadgeAlert, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const { users, updateUserStatus, deleteUser, usersLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer" | "admin">("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" ? u.role === "admin" || u.role === "super_admin" : u.role === "customer");
    return matchesSearch && matchesRole;
  });

  const handleDeleteConfirm = () => {
    if (!confirmDeleteId) return;
    const user = users.find((u) => u.id === confirmDeleteId);
    deleteUser(confirmDeleteId);
    toast.success(`"${user?.name}" has been deleted.`);
    setConfirmDeleteId(null);
  };

  if (usersLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-6">

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm flex flex-col gap-5">
            <div>
              <h2 className="text-base font-black text-black">Delete User</h2>
              <p className="text-xs text-zinc-500 font-semibold mt-1">
                Are you sure you want to permanently delete <span className="text-black font-extrabold">{users.find((u) => u.id === confirmDeleteId)?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header controls */}
      <section className="flex justify-between items-center border-b border-gray-300 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase text-black">User Management</h1>
          <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Moderate customer profiles, restrict access permissions, and audit customer spend statistics</p>
        </div>
      </section>

      {/* Search + Filter Bar */}
      <section className="flex flex-wrap justify-between items-center gap-3 bg-white border border-gray-300 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Name, Email or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-zinc-50 px-4 py-2 pl-10 text-xs font-semibold text-black focus:border-black focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 text-zinc-400" size={14} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Filter by Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="rounded-xl border border-gray-300 bg-zinc-50 px-3 py-2 text-xs font-bold text-black focus:outline-none focus:border-black"
          >
            <option value="all">All Users</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </section>

      {/* Users table */}
      <section className="bg-white border border-gray-300 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto text-xs text-left">
          {filteredUsers.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Account Role</th>
                  <th className="p-4">Orders Count</th>
                  <th className="p-4">Total Spending</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Set Status</th>
                  <th className="p-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin" || u.role === "super_admin";
                  return (
                    <tr key={u.id} className="border-b border-gray-100 last:border-none hover:bg-zinc-50/50">
                      <td className="p-4">
                        <div>
                          <p className="font-extrabold text-sm text-black">{u.name}</p>
                          <p className="text-[10px] text-zinc-400 font-semibold">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-zinc-500">{u.mobile}</td>
                      <td className="p-4 font-bold uppercase text-[9px]">
                        <span className={`inline-block px-2 py-0.5 rounded ${
                          isAdmin ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-zinc-500">{u.ordersCount} Orders</td>
                      <td className="p-4 font-black text-sm text-black">₹{u.spending}</td>
                      <td className="p-4">
                        {u.blocked ? (
                          <span className="px-2.5 py-0.5 rounded bg-red-50 text-red-700 font-bold uppercase text-[9px] flex items-center gap-1 w-max">
                            <BadgeAlert size={10} /> Blocked
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-green-50 text-green-700 font-bold uppercase text-[9px] w-max block">Active</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {u.email === "admin@athletica.com" ? (
                          <span className="text-[10px] text-zinc-400 font-semibold italic">System Owner</span>
                        ) : u.blocked ? (
                          <button
                            onClick={() => updateUserStatus(u.id, false)}
                            className="bg-white hover:bg-zinc-50 text-[#2563EB] border border-gray-300 px-3.5 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center gap-1.5 mx-auto"
                          >
                            <UserCheck size={12} /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(u.id, true)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center gap-1.5 mx-auto"
                          >
                            <UserX size={12} /> Block Access
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {isAdmin || u.email === "admin@athletica.com" ? (
                          <span className="text-[10px] text-zinc-300 font-semibold italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1.5 rounded-xl transition-colors mx-auto flex items-center justify-center"
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 italic text-zinc-400">No users match search criteria.</div>
          )}
        </div>
      </section>

    </div>
  );
}
