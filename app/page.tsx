"use client";

import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import OutputPanel from "@/components/OutputPanel";
import { animate, createScope } from "animejs";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const root = useRef<HTMLElement | null>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<"ppt" | "pdf" | null>(
    null
  );

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({ root: root.current }).add(() => {
      animate('[data-animate="sidebar"]', {
        translateX: ["-40px", "0px"],
        opacity: [0, 1],
        duration: 700,
        ease: "out(4)",
      });

      animate('[data-animate="header"]', {
        translateY: ["-12px", "0px"],
        opacity: [0, 1],
        duration: 600,
        delay: 150,
        ease: "out(4)",
      });

      animate('[data-animate="hero"]', {
        translateY: ["20px", "0px"],
        opacity: [0, 1],
        duration: 700,
        delay: 250,
        ease: "out(4)",
      });

      animate('[data-animate="prompt"]', {
        translateY: ["25px", "0px"],
        scale: [0.98, 1],
        opacity: [0, 1],
        duration: 800,
        delay: 400,
        ease: "out(4)",
      });

      animate('[data-animate="status"]', {
        opacity: [0, 1],
        duration: 500,
        delay: 700,
      });
    });

    return () => scope.current?.revert();
  }, []);

  const clearDownload = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setDownloadUrl(null);
    setDownloadType(null);
  };

  const handleImageGenerated = (image: string) => {
    setGeneratedImage(image);
    setGeneratedVideo(null);
    setOutput("");
    clearDownload();
  };

  const handleVideoGenerated = (video: string) => {
    setGeneratedVideo(video);
    setGeneratedImage(null);
    setOutput("");
    clearDownload();
  };

  const handleSubmit = async (
    prompt: string,
    file?: File
  ) => {
    setLoading(true);
    setOutput("");
    setGeneratedImage(null);
    setGeneratedVideo(null);
    clearDownload();

    try {
      /*
       * PDF ATTACHED
       *
       * IMPORTANT:
       * We DO NOT call the orchestrator here.
       *
       * The PDF + user's instruction goes directly
       * to Gemini through /api/pdf-chat.
       */
      if (file) {
        const formData = new FormData();

        formData.append("prompt", prompt);
        formData.append("file", file);

        setOutput("Reading your PDF...");

        const response = await fetch("/api/pdf-chat", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to process PDF"
          );
        }

        setOutput(data.text);

        return;
      }

      /*
       * NO ATTACHMENT
       *
       * Normal flow:
       * Prompt → Orchestrator → Chat/PDF/PPT
       */
      const orchestratorResponse = await fetch(
        "/api/orchestrate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      const orchestratorData =
        await orchestratorResponse.json();

      if (!orchestratorResponse.ok) {
        throw new Error(
          orchestratorData.error ||
            "Orchestrator failed"
        );
      }

      console.log(
        "Detected intent:",
        orchestratorData.intent
      );

      if (orchestratorData.intent === "ppt") {
        setOutput(
          "Creating your 6-slide PowerPoint presentation..."
        );

        const response = await fetch("/api/ppt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const data = await response.json();

          throw new Error(
            data.error ||
              "Failed to generate PowerPoint"
          );
        }

        setDownloadUrl(
          URL.createObjectURL(
            await response.blob()
          )
        );

        setDownloadType("ppt");

        setOutput(
          "Your 6-slide PowerPoint presentation has been generated successfully."
        );

        return;
      }

      if (orchestratorData.intent === "pdf") {
        setOutput(
          "Creating your PDF document..."
        );

        const response = await fetch("/api/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const data = await response.json();

          throw new Error(
            data.error ||
              "Failed to generate PDF"
          );
        }

        setDownloadUrl(
          URL.createObjectURL(
            await response.blob()
          )
        );

        setDownloadType("pdf");

        setOutput(
          "Your PDF document has been generated successfully."
        );

        return;
      }

      if (orchestratorData.intent === "chat") {
        setOutput("Thinking...");

        const response = await fetch(
          "/api/gemini",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Gemini request failed"
          );
        }

        setOutput(data.text);

        return;
      }

      setOutput(
        `I detected this as a "${orchestratorData.intent}" request.\n\nThat agent hasn't been implemented yet.`
      );
    } catch (error) {
      console.error(error);

      setOutput(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const fileName =
    downloadType === "pdf"
      ? "ai-studio-document.pdf"
      : "ai-studio-presentation.pptx";

  const downloadLabel =
    downloadType === "pdf"
      ? "Download PDF"
      : "Download PowerPoint";

  return (
    <main
      ref={root}
      className="flex min-h-screen bg-[#050505] text-white"
    >
      <Sidebar />

      <section className="relative flex flex-1 flex-col">
        <header
          data-animate="header"
          className="flex h-16 items-center justify-between border-b border-white/5 px-8"
        >
          <span className="text-xs text-white/30">
            New Workspace
          </span>

          <div
            data-animate="status"
            className="flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs text-white/40">
              Gemini connected
            </span>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center px-6 py-16">
          {!output &&
            !downloadUrl &&
            !generatedImage &&
            !generatedVideo && (
              <div
                data-animate="hero"
                className="mb-10 mt-20 text-center"
              >
                <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/40">
                  Multimodal AI Workspace
                </div>

                <h1 className="text-4xl font-semibold tracking-tight">
                  What do you want to create?
                </h1>

                <p className="mt-3 text-sm text-white/30">
                  Give AI a prompt, upload a document,
                  or provide a URL.
                </p>
              </div>
            )}

          <PromptBox
            onSubmit={handleSubmit}
            loading={loading}
            onImageGenerated={handleImageGenerated}
            onVideoGenerated={handleVideoGenerated}
          />

          {generatedImage && (
            <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <img
                src={generatedImage}
                alt="Generated image"
                className="h-auto w-full object-contain"
              />
            </div>
          )}

          {generatedVideo && (
            <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <video
                src={generatedVideo}
                controls
                playsInline
                className="h-auto w-full"
              />
            </div>
          )}

          <OutputPanel
            output={output}
            downloadUrl={downloadUrl}
            fileName={fileName}
            downloadLabel={downloadLabel}
          />
        </div>
      </section>
    </main>
  );
}