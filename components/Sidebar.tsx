"use client";

import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-animate="sidebar"
      className={`relative flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#0a0a0a] p-4 transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div
        className={`mb-8 flex items-center ${
          collapsed ? "justify-center" : "gap-2 px-2"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black">
          <Sparkles size={17} />
        </div>

        {!collapsed && (
          <span className="whitespace-nowrap text-sm font-semibold tracking-wide">
            INTELLISOURCE
          </span>
        )}
      </div>

      <div className="space-y-1">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-white/30">
            Workspace
          </p>
        )}

        <div
          className={`flex h-10 items-center rounded-lg bg-white/10 text-sm text-white ${
            collapsed
              ? "w-full justify-center"
              : "w-full gap-3 px-3"
          }`}
          title={collapsed ? "Create" : undefined}
        >
          <Sparkles size={16} />

          {!collapsed && (
            <span className="whitespace-nowrap">
              Create
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute -right-3 top-7 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-white/50 shadow-lg transition hover:bg-white hover:text-black"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={13} />
        ) : (
          <ChevronLeft size={13} />
        )}
      </button>

      <div
        className={`mt-auto text-xs text-white/20 ${
          collapsed ? "text-center" : "px-2"
        }`}
      >
        {collapsed ? "v0.1" : "Prototype v0.1"}
      </div>
    </aside>
  );
}