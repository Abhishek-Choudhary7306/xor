"use client";

import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import OutputPanel from "@/components/OutputPanel";
import { animate, createScope } from "animejs";
import {
  BriefcaseBusiness,
  Copy,
  MessageSquareText,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type SpecializedType =
  | "linkedin"
  | "x"
  | "advisory";

type SpecializedData = {
  [key: string]: unknown;
};

const typingTexts = [
  "create?",
  "build?",
  "design?",
  "write?",
  "analyze?",
];

export default function Home() {
  const root = useRef<HTMLElement | null>(null);

  const scope =
    useRef<ReturnType<typeof createScope> | null>(
      null
    );

  const [output, setOutput] = useState("");
  const [loading, setLoading] =
    useState(false);

  const [downloadUrl, setDownloadUrl] =
    useState<string | null>(null);

  const [downloadType, setDownloadType] =
    useState<"ppt" | "pdf" | null>(null);

  const [generatedImage, setGeneratedImage] =
    useState<string | null>(null);

  const [generatedVideo, setGeneratedVideo] =
    useState<string | null>(null);

  const [specializedType, setSpecializedType] =
    useState<SpecializedType | null>(null);

  const [specializedData, setSpecializedData] =
    useState<SpecializedData | null>(null);

  /* =========================================================
     TYPEWRITER HERO
     ========================================================= */

  const [typingText, setTypingText] =
    useState("");

  const [typingIndex, setTypingIndex] =
    useState(0);

  const [isDeleting, setIsDeleting] =
    useState(false);

  useEffect(() => {
    const currentText =
      typingTexts[typingIndex] ?? "create?";

    const typingSpeed = isDeleting ? 55 : 95;

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        setTypingText(
          currentText.slice(
            0,
            typingText.length + 1
          )
        );

        if (
          typingText.length + 1 ===
          currentText.length
        ) {
          window.setTimeout(() => {
            setIsDeleting(true);
          }, 1100);
        }
      } else {
        setTypingText(
          currentText.slice(
            0,
            Math.max(0, typingText.length - 1)
          )
        );

        if (typingText.length === 0) {
          setIsDeleting(false);

          setTypingIndex(
            (previous) =>
              (previous + 1) %
              typingTexts.length
          );
        }
      }
    }, typingSpeed);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    typingText,
    typingIndex,
    isDeleting,
  ]);

  /* =========================================================
     INTRO ANIMATION
     ========================================================= */

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({
      root: root.current,
    }).add(() => {
      animate(
        '[data-animate="sidebar"]',
        {
          translateX: ["-40px", "0px"],
          opacity: [0, 1],
          duration: 700,
          ease: "out(4)",
        }
      );

      animate(
        '[data-animate="header"]',
        {
          translateY: ["-12px", "0px"],
          opacity: [0, 1],
          duration: 600,
          delay: 150,
          ease: "out(4)",
        }
      );

      animate(
        '[data-animate="hero"]',
        {
          translateY: ["20px", "0px"],
          opacity: [0, 1],
          duration: 700,
          delay: 250,
          ease: "out(4)",
        }
      );

      animate(
        '[data-animate="prompt"]',
        {
          translateY: ["25px", "0px"],
          scale: [0.98, 1],
          opacity: [0, 1],
          duration: 800,
          delay: 400,
          ease: "out(4)",
        }
      );

      animate(
        '[data-animate="status"]',
        {
          opacity: [0, 1],
          duration: 500,
          delay: 700,
        }
      );
    });

    return () =>
      scope.current?.revert();
  }, []);

  /* =========================================================
     CLEANUP
     ========================================================= */

  const clearDownload = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setDownloadUrl(null);
    setDownloadType(null);
  };

  const clearSpecialized = () => {
    setSpecializedType(null);
    setSpecializedData(null);
  };

  /* =========================================================
     GENERATED IMAGE
     ========================================================= */

  const handleImageGenerated = (
    image: string
  ) => {
    setGeneratedImage(image);
    setGeneratedVideo(null);
    setOutput("");

    clearDownload();
    clearSpecialized();
  };

  /* =========================================================
     GENERATED VIDEO
     ========================================================= */

  const handleVideoGenerated = (
    video: string
  ) => {
    setGeneratedVideo(video);
    setGeneratedImage(null);
    setOutput("");

    clearDownload();
    clearSpecialized();
  };

  /* =========================================================
     SPECIALIZED RESPONSE

     PromptBox
          ↓
     /api/specialized
          ↓
        Gemini

     There is NO orchestrator involved.
     ========================================================= */

  const handleSpecializedGenerated = (
    type: SpecializedType,
    data: unknown
  ) => {
    setSpecializedType(type);

    setSpecializedData(
      data as SpecializedData
    );

    setOutput("");
    setGeneratedImage(null);
    setGeneratedVideo(null);

    clearDownload();
  };

  /* =========================================================
     MAIN SUBMIT FLOW
     ========================================================= */

  const handleSubmit = async (
    prompt: string,
    file?: File
  ) => {
    setLoading(true);

    setOutput("");
    setGeneratedImage(null);
    setGeneratedVideo(null);

    clearDownload();
    clearSpecialized();

    try {
      /* =====================================================
         PDF ATTACHED

         Direct PDF chat.
         NO ORCHESTRATOR.
         ===================================================== */

      if (file) {
        const formData = new FormData();

        formData.append(
          "prompt",
          prompt
        );

        formData.append(
          "file",
          file
        );

        setOutput(
          "Reading your PDF..."
        );

        const response = await fetch(
          "/api/pdf-chat",
          {
            method: "POST",
            body: formData,
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to process PDF"
          );
        }

        setOutput(data.text);

        return;
      }

      /* =====================================================
         NORMAL PROMPT

         Prompt → Orchestrator
         ===================================================== */

      const orchestratorResponse =
        await fetch(
          "/api/orchestrate",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt,
            }),
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

      /* =====================================================
         PPT
         ===================================================== */

      if (
        orchestratorData.intent ===
        "ppt"
      ) {
        setOutput(
          "Creating your 6-slide PowerPoint presentation..."
        );

        const response = await fetch(
          "/api/ppt",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt,
            }),
          }
        );

        if (!response.ok) {
          const data =
            await response.json();

          throw new Error(
            data.error ||
              "Failed to generate PowerPoint"
          );
        }

        const blob =
          await response.blob();

        setDownloadUrl(
          URL.createObjectURL(blob)
        );

        setDownloadType("ppt");

        setOutput(
          "Your 6-slide PowerPoint presentation has been generated successfully."
        );

        return;
      }

      /* =====================================================
         PDF
         ===================================================== */

      if (
        orchestratorData.intent ===
        "pdf"
      ) {
        setOutput(
          "Creating your PDF document..."
        );

        const response = await fetch(
          "/api/pdf",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt,
            }),
          }
        );

        if (!response.ok) {
          const data =
            await response.json();

          throw new Error(
            data.error ||
              "Failed to generate PDF"
          );
        }

        const blob =
          await response.blob();

        setDownloadUrl(
          URL.createObjectURL(blob)
        );

        setDownloadType("pdf");

        setOutput(
          "Your PDF document has been generated successfully."
        );

        return;
      }

      /* =====================================================
         CHAT
         ===================================================== */

      if (
        orchestratorData.intent ===
        "chat"
      ) {
        setOutput(
          "Thinking..."
        );

        const response = await fetch(
          "/api/gemini",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              prompt,
            }),
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

  /* =========================================================
     DOWNLOAD
     ========================================================= */

  const fileName =
    downloadType === "pdf"
      ? "ai-studio-document.pdf"
      : "ai-studio-presentation.pptx";

  const downloadLabel =
    downloadType === "pdf"
      ? "Download PDF"
      : "Download PowerPoint";

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <main
      ref={root}
      className="flex min-h-screen bg-[#050505] text-white"
    >
      <Sidebar />

      <section className="relative flex flex-1 flex-col">
        {/* ===================================================
            HEADER
            =================================================== */}

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

        {/* ===================================================
            CONTENT
            =================================================== */}

        <div className="flex flex-1 flex-col items-center px-6 py-16">
          {/* =================================================
              HERO
              ================================================= */}

          {!output &&
            !downloadUrl &&
            !generatedImage &&
            !generatedVideo &&
            !specializedData && (
              <div
                data-animate="hero"
                className="mb-10 mt-20 text-center"
              >
                <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/40">
                  Multimodal AI Workspace
                </div>

                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  What do you want to{" "}
                  <span className="inline-block min-w-[150px] text-left">
                    {typingText}
                    <span className="ml-1 inline-block h-9 w-px translate-y-1 animate-pulse bg-white/60" />
                  </span>
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/30">
                  Give AI a prompt or upload
                  a document and let AI Studio
                  handle the rest.
                </p>
              </div>
            )}

          {/* =================================================
              PROMPT BOX
              ================================================= */}

          <div
            data-animate="prompt"
            className="w-full max-w-2xl"
          >
            <PromptBox
              onSubmit={handleSubmit}
              loading={loading}
              onImageGenerated={
                handleImageGenerated
              }
              onVideoGenerated={
                handleVideoGenerated
              }
              onSpecializedGenerated={
                handleSpecializedGenerated
              }
            />
          </div>

          {/* =================================================
              GENERATED IMAGE
              ================================================= */}

          {generatedImage && (
            <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <img
                src={generatedImage}
                alt="Generated image"
                className="h-auto w-full object-contain"
              />
            </div>
          )}

          {/* =================================================
              GENERATED VIDEO
              ================================================= */}

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

          {/* =================================================
              SPECIALIZED STRUCTURED OUTPUT
              ================================================= */}

          {specializedData &&
            specializedType && (
              <SpecializedOutput
                type={specializedType}
                data={specializedData}
              />
            )}

          {/* =================================================
              NORMAL OUTPUT
              ================================================= */}

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

/* =========================================================
   SPECIALIZED OUTPUT
   ========================================================= */

function SpecializedOutput({
  type,
  data,
}: {
  type: SpecializedType;
  data: SpecializedData;
}) {
  if (type === "linkedin") {
    return (
      <LinkedInOutput data={data} />
    );
  }

  if (type === "x") {
    return <XOutput data={data} />;
  }

  return (
    <AdvisoryOutput data={data} />
  );
}

/* =========================================================
   LINKEDIN
   ========================================================= */

function LinkedInOutput({
  data,
}: {
  data: SpecializedData;
}) {
  const hashtags =
    Array.isArray(data.hashtags)
      ? data.hashtags
      : [];

  const copyContent = [
    data.hook,
    data.content,
    data.call_to_action,
    hashtags.join(" "),
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
            <span className="text-sm font-bold">
              in
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              LinkedIn
            </p>

            <p className="text-xs text-white/30">
              Generated post
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <OutputSection
          label="Title"
          value={data.title}
        />

        <OutputSection
          label="Hook"
          value={data.hook}
        />

        <OutputSection
          label="Content"
          value={data.content}
          large
        />

        <OutputSection
          label="Call to Action"
          value={data.call_to_action}
        />

        <TagList
          label="Hashtags"
          values={hashtags}
        />

        <CopyButton
          value={copyContent}
        />
      </div>
    </div>
  );
}

/* =========================================================
   X
   ========================================================= */

function XOutput({
  data,
}: {
  data: SpecializedData;
}) {
  const posts =
    Array.isArray(data.posts)
      ? data.posts
      : [];

  const copyContent = posts
    .map(
      (post, index) =>
        `${index + 1}. ${String(post)}`
    )
    .join("\n\n");

  return (
    <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
            <MessageSquareText
              size={18}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              X
            </p>

            <p className="text-xs text-white/30">
              {String(
                data.type || "post"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <OutputSection
          label="Hook"
          value={data.hook}
        />

        <div>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-white/30">
            {posts.length > 1
              ? "Thread"
              : "Post"}
          </p>

          <div className="space-y-3">
            {posts.map(
              (post, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  {posts.length > 1 && (
                    <p className="mb-2 text-[10px] text-white/25">
                      Post{" "}
                      {index + 1}
                    </p>
                  )}

                  <p className="whitespace-pre-wrap text-sm leading-6 text-white/80">
                    {String(post)}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <OutputSection
          label="Call to Action"
          value={data.call_to_action}
        />

        <TagList
          label="Hashtags"
          values={
            Array.isArray(
              data.hashtags
            )
              ? data.hashtags
              : []
          }
        />

        <CopyButton
          value={copyContent}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ADVISORY
   ========================================================= */

function AdvisoryOutput({
  data,
}: {
  data: SpecializedData;
}) {
  return (
    <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
            <BriefcaseBusiness
              size={18}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              Advisory
            </p>

            <p className="text-xs text-white/30">
              Strategic analysis
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <OutputSection
          label="Summary"
          value={data.summary}
          large
        />

        <ListSection
          label="Key Points"
          values={data.key_points}
        />

        <ListSection
          label="Opportunities"
          values={data.opportunities}
        />

        <ListSection
          label="Risks"
          values={data.risks}
        />

        <ListSection
          label="Recommendations"
          values={data.recommendations}
        />

        <ListSection
          label="Next Steps"
          values={data.next_steps}
        />
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE OUTPUT UI
   ========================================================= */

function OutputSection({
  label,
  value,
  large = false,
}: {
  label: string;
  value: unknown;
  large?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </p>

      <p
        className={
          large
            ? "whitespace-pre-wrap text-sm leading-7 text-white/80"
            : "whitespace-pre-wrap text-sm leading-6 text-white/70"
        }
      >
        {String(
          value || "Not provided"
        )}
      </p>
    </div>
  );
}

function ListSection({
  label,
  values,
}: {
  label: string;
  values: unknown;
}) {
  const items = Array.isArray(values)
    ? values
    : [];

  return (
    <div>
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-white/30">
          None provided.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map(
            (item, index) => (
              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-white/70"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />

                <span>
                  {String(item)}
                </span>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

function TagList({
  label,
  values,
}: {
  label: string;
  values: unknown[];
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {values.length === 0 ? (
          <span className="text-sm text-white/30">
            None
          </span>
        ) : (
          values.map(
            (value, index) => (
              <span
                key={index}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60"
              >
                {String(value)}
              </span>
            )
          )
        )}
      </div>
    </div>
  );
}

function CopyButton({
  value,
}: {
  value: string;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        value
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
    >
      <Copy size={14} />
      Copy
    </button>
  );
}