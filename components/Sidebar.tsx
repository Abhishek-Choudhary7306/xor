"use client";

import { FileText, History, Image, Plus, Sparkles } from "lucide-react";

export default function Sidebar() {
  return (
    <aside
  data-animate="sidebar"
  className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#0a0a0a] p-4"
>
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
          <Sparkles size={17} />
        </div>

        <span className="text-sm font-semibold tracking-wide">
          AI STUDIO
        </span>
      </div>

      {/* New project */}
      <button className="mb-6 flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
        <Plus size={17} />
        New Project
      </button>

      {/* Navigation */}
      <div className="space-y-1">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-white/30">
          Workspace
        </p>

        <button className="flex w-full items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-sm text-white">
          <Sparkles size={16} />
          Create
        </button>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
          <History size={16} />
          History
        </button>
      </div>

      {/* Quick actions */}
      <div className="mt-8 space-y-1">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-white/30">
          Quick Actions
        </p>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
          <FileText size={16} />
          PDF → PPT
        </button>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
          <Image size={16} />
          Generate Image
        </button>
      </div>

      {/* Bottom */}
      <div className="mt-auto px-2 text-xs text-white/20">
        Prototype v0.1
      </div>
    </aside>
  );
}