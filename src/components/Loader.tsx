"use client";

import React from "react";
import { LoaderProps } from "@/types/common";


export default function Loader({ fullScreen = true, text, size = 40 }: LoaderProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="animate-spin rounded-full border-[3px] border-zinc-200 border-t-[#111111]"
        style={{ width: size, height: size }}
      />
      {text && (
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {spinner}
    </div>
  );
}
