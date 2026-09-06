"use client";

import { ArrowUp, Link, Loader2, Paperclip } from "lucide-react";
import { useState } from "react";

type PromptBoxProps = {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
};

export default function PromptBox({
  onSubmit,
  loading = false,
}: PromptBoxProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    const value = prompt.trim();

    if (!value || loading) return;

    onSubmit(value);
    setPrompt("");
  };

  return (
    <div
      data-animate="prompt"
      className="w-full max-w-3xl"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl transition focus-within:border-white/20">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Describe what you want to create..."
          rows={4}
          disabled={loading}
          className="w-full resize-none bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
              title="Upload file"
            >
              <Paperclip size={17} />
            </button>

            <button
              type="button"
              className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
              title="Add URL"
            >
              <Link size={17} />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || loading}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-20"
          >
            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <ArrowUp size={17} />
            )}
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-white/20">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}