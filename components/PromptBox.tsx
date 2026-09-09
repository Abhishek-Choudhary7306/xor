"use client";

import {
  ArrowUp,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Video,
  X,
  MessageSquareText,
  BriefcaseBusiness,
} from "lucide-react";
import { useRef, useState } from "react";

type SpecializedType =
  | "linkedin"
  | "x"
  | "advisory";

type PromptBoxProps = {
  onSubmit: (
    prompt: string,
    file?: File
  ) => void;

  onImageGenerated?: (
    image: string
  ) => void;

  onVideoGenerated?: (
    video: string
  ) => void;

  onSpecializedGenerated?: (
    type: SpecializedType,
    data: unknown
  ) => void;

  loading?: boolean;
};

export default function PromptBox({
  onSubmit,
  onImageGenerated,
  onVideoGenerated,
  onSpecializedGenerated,
  loading = false,
}: PromptBoxProps) {
  const [prompt, setPrompt] =
    useState("");

  const [imageLoading, setImageLoading] =
    useState(false);

  const [videoLoading, setVideoLoading] =
    useState(false);

  const [
    specializedLoading,
    setSpecializedLoading,
  ] =
    useState<SpecializedType | null>(
      null
    );

  const [attachedFile, setAttachedFile] =
    useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /* =========================================================
     PDF UPLOAD
     ========================================================= */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      file.type !==
      "application/pdf"
    ) {
      alert(
        "Please upload a PDF file."
      );

      event.target.value = "";
      return;
    }

    setAttachedFile(file);

    event.target.value = "";
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  /* =========================================================
     NORMAL SUBMIT
     ========================================================= */

  const handleSubmit = () => {
    const value = prompt.trim();

    if (
      !value ||
      loading ||
      imageLoading ||
      videoLoading ||
      specializedLoading
    ) {
      return;
    }

    onSubmit(
      value,
      attachedFile ?? undefined
    );

    setPrompt("");
    setAttachedFile(null);
  };

  /* =========================================================
     IMAGE GENERATION
     ========================================================= */

  const handleGenerateImage =
    async () => {
      const value = prompt.trim();

      if (
        !value ||
        loading ||
        imageLoading ||
        videoLoading ||
        specializedLoading ||
        attachedFile
      ) {
        return;
      }

      setImageLoading(true);

      try {
        const response = await fetch(
          "/api/image",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt: value,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Image generation failed"
          );
        }

        if (!data.image) {
          throw new Error(
            "No image was returned"
          );
        }

        onImageGenerated?.(
          data.image
        );

        setPrompt("");
      } catch (error) {
        console.error(
          "Image generation error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Failed to generate image"
        );
      } finally {
        setImageLoading(false);
      }
    };

  /* =========================================================
     VIDEO GENERATION
     ========================================================= */

  const handleGenerateVideo =
    async () => {
      const value = prompt.trim();

      if (
        !value ||
        loading ||
        imageLoading ||
        videoLoading ||
        specializedLoading ||
        attachedFile
      ) {
        return;
      }

      setVideoLoading(true);

      try {
        const response = await fetch(
          "/api/video",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt: value,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Video generation failed"
          );
        }

        if (!data.video) {
          throw new Error(
            "No video was returned"
          );
        }

        onVideoGenerated?.(
          data.video
        );

        setPrompt("");
      } catch (error) {
        console.error(
          "Video generation error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Failed to generate video"
        );
      } finally {
        setVideoLoading(false);
      }
    };

  /* =========================================================
     SPECIALIZED ACTIONS

     These DO NOT use the orchestrator.

     Button
        ↓
     /api/specialized
        ↓
     Gemini directly
     ========================================================= */

  const handleSpecialized = async (
    type: SpecializedType
  ) => {
    const value = prompt.trim();

    if (
      !value ||
      loading ||
      imageLoading ||
      videoLoading ||
      specializedLoading ||
      attachedFile
    ) {
      return;
    }

    setSpecializedLoading(type);

    try {
      const response = await fetch(
        "/api/specialized",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type,
            prompt: value,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Specialized generation failed"
        );
      }

      if (!data.data) {
        throw new Error(
          "No structured response was returned"
        );
      }

      onSpecializedGenerated?.(
        type,
        data.data
      );

      setPrompt("");
    } catch (error) {
      console.error(
        "Specialized generation error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate content"
      );
    } finally {
      setSpecializedLoading(null);
    }
  };

  const busy =
    loading ||
    imageLoading ||
    videoLoading ||
    !!specializedLoading;

  return (
    <div
      data-animate="prompt"
      className="w-full max-w-3xl"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl transition focus-within:border-white/20">

        {/* ===================================================
            MEDIA GENERATION
            =================================================== */}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={
              handleGenerateImage
            }
            disabled={
              !prompt.trim() ||
              busy ||
              !!attachedFile
            }
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
          >
            {imageLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <ImageIcon size={15} />
            )}

            {imageLoading
              ? "Generating..."
              : "Generate Image"}
          </button>

          <button
            type="button"
            onClick={
              handleGenerateVideo
            }
            disabled={
              !prompt.trim() ||
              busy ||
              !!attachedFile
            }
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
          >
            {videoLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Video size={15} />
            )}

            {videoLoading
              ? "Generating..."
              : "Generate Video"}
          </button>
        </div>

        {/* ===================================================
            SPECIALIZED AI
            =================================================== */}

        <div className="mb-3 flex flex-wrap items-center gap-2">

          {/* LinkedIn */}

          <button
            type="button"
            onClick={() =>
              handleSpecialized(
                "linkedin"
              )
            }
            disabled={
              !prompt.trim() ||
              busy ||
              !!attachedFile
            }
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
          >
            {specializedLoading ===
            "linkedin" ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-white text-[10px] font-bold text-black">
                in
              </div>
            )}

            {specializedLoading ===
            "linkedin"
              ? "Creating..."
              : "LinkedIn"}
          </button>

          {/* X */}

          <button
            type="button"
            onClick={() =>
              handleSpecialized("x")
            }
            disabled={
              !prompt.trim() ||
              busy ||
              !!attachedFile
            }
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
          >
            {specializedLoading ===
            "x" ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <MessageSquareText
                size={15}
              />
            )}

            {specializedLoading === "x"
              ? "Creating..."
              : "X"}
          </button>

          {/* Advisory */}

          <button
            type="button"
            onClick={() =>
              handleSpecialized(
                "advisory"
              )
            }
            disabled={
              !prompt.trim() ||
              busy ||
              !!attachedFile
            }
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
          >
            {specializedLoading ===
            "advisory" ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <BriefcaseBusiness
                size={15}
              />
            )}

            {specializedLoading ===
            "advisory"
              ? "Analyzing..."
              : "Advisory"}
          </button>
        </div>

        {/* ===================================================
            ATTACHED PDF
            =================================================== */}

        {attachedFile && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <Paperclip
                size={15}
                className="shrink-0 text-white/50"
              />

              <span className="truncate text-xs text-white/70">
                {attachedFile.name}
              </span>

              <span className="shrink-0 text-[10px] text-white/30">
                PDF
              </span>
            </div>

            <button
              type="button"
              onClick={
                handleRemoveFile
              }
              disabled={busy}
              className="rounded-md p-1 text-white/30 transition hover:bg-white/10 hover:text-white"
              title="Remove PDF"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ===================================================
            PROMPT
            =================================================== */}

        <textarea
          value={prompt}
          onChange={(e) =>
            setPrompt(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={
            attachedFile
              ? "What would you like me to do with this PDF?"
              : "Describe what you want to create..."
          }
          rows={4}
          disabled={busy}
          className="w-full resize-none bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
        />

        {/* ===================================================
            BOTTOM CONTROLS
            =================================================== */}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">

            {/* Hidden PDF Input */}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                handleFileChange
              }
              className="hidden"
            />

            {/* Upload PDF */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={busy}
              className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              title="Upload PDF"
            >
              <Paperclip size={17} />
            </button>
          </div>

          {/* Send */}

          <button
            onClick={handleSubmit}
            disabled={
              !prompt.trim() ||
              busy
            }
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
        Enter to send · Shift + Enter
        for a new line
      </p>
    </div>
  );
}