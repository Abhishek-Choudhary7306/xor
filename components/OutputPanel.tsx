"use client";

import { Bot, Download } from "lucide-react";

type OutputPanelProps = {
  output: string;
  downloadUrl?: string | null;
  fileName?: string;
  downloadLabel?: string;
};

export default function OutputPanel({
  output,
  downloadUrl,
  fileName = "ai-studio-presentation.pptx",
  downloadLabel = "Download PowerPoint",
}: OutputPanelProps) {
  if (!output && !downloadUrl) return null;

  return (
    <div className="mt-10 w-full max-w-3xl">
      {output && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black">
              <Bot size={15} />
            </div>
            <span className="text-xs font-medium text-white/60">AI Studio</span>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-7 text-white/80">
            {output}
          </div>
        </div>
      )}

      {downloadUrl && (
        <a
          href={downloadUrl}
          download={fileName}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
        >
          <Download size={17} />
          {downloadLabel}
        </a>
      )}
    </div>
  );
}