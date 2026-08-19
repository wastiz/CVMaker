"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { coverLetterApi, type CoverLetter } from "@/api/coverLetterApi";
import { CoverLetterPreviewModal } from "@/components/cover-letter/CoverLetterPreviewModal";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved";

export default function CoverLetterEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ title: "", content: "" });

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingTxt, setDownloadingTxt] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    coverLetterApi
      .get(id)
      .then(({ data }) => {
        setLetter(data);
        setTitle(data.title);
        setContent(data.content);
        latestRef.current = { title: data.title, content: data.content };
      })
      .catch(() => toast.error("Failed to load cover letter"))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  async function save(t: string, c: string) {
    setSaveState("saving");
    try {
      await coverLetterApi.update(id, { title: t, content: c });
      setSaveState("saved");
      setTimeout(
        () => setSaveState((prev) => (prev === "saved" ? "idle" : prev)),
        2000
      );
    } catch {
      setSaveState("idle");
      toast.error("Failed to save");
    }
  }

  function scheduleSave(t: string, c: string) {
    latestRef.current = { title: t, content: c };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(t, c), 800);
  }

  function flushSave() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    save(latestRef.current.title, latestRef.current.content);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    latestRef.current = { ...latestRef.current, title: value };
    scheduleSave(value, latestRef.current.content);
  }

  function handleContentChange(value: string) {
    setContent(value);
    latestRef.current = { ...latestRef.current, content: value };
    scheduleSave(latestRef.current.title, value);
  }

  async function handlePreview() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      await save(latestRef.current.title, latestRef.current.content);
    }
    setPreviewOpen(true);
  }

  async function handleDownload(type: "pdf" | "txt") {
    if (type === "pdf") setDownloadingPdf(true);
    else setDownloadingTxt(true);

    // Flush pending save so the export reflects latest content
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      await save(latestRef.current.title, latestRef.current.content);
    }

    try {
      const { data } =
        type === "pdf"
          ? await coverLetterApi.getPdf(id)
          : await coverLetterApi.getTxt(id);

      const mimeType = type === "pdf" ? "application/pdf" : "text/plain";
      const ext = type;
      const url = URL.createObjectURL(new Blob([data], { type: mimeType }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "cover-letter"}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(`Failed to download ${type.toUpperCase()}`);
    } finally {
      if (type === "pdf") setDownloadingPdf(false);
      else setDownloadingTxt(false);
    }
  }

  if (isLoading || !letter) {
    return (
      <div className="-m-6 flex flex-col overflow-hidden" style={{ height: "100vh" }}>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <div className="h-7 w-7 animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6 flex flex-col overflow-hidden" style={{ height: "100vh" }}>
      {/* ── Header ── */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => router.push("/cover-letters")}
          className="shrink-0"
          title="Back to cover letters"
        >
          <ArrowLeft className="size-4" />
        </Button>

        {/* Editable title */}
        <div className="flex min-w-0 flex-1 items-center">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                flushSave();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  setEditingTitle(false);
                  flushSave();
                }
              }}
              className="min-w-0 flex-1 truncate rounded-md border border-ring bg-transparent px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/50"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="truncate rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-muted"
              title="Click to edit title"
            >
              {title || "Untitled"}
            </button>
          )}
        </div>

        {/* Save indicator */}
        <span
          className={cn(
            "shrink-0 text-xs transition-opacity",
            saveState === "idle" ? "opacity-0" : "opacity-100",
            saveState === "saving"
              ? "text-muted-foreground"
              : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {saveState === "saving" ? "Saving…" : "Saved"}
        </span>

        {/* Export buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePreview}
            className="gap-1.5"
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload("pdf")}
            disabled={downloadingPdf || downloadingTxt}
            className="gap-1.5"
          >
            <Download className="size-3.5" />
            {downloadingPdf ? "…" : "PDF"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload("txt")}
            disabled={downloadingPdf || downloadingTxt}
            className="gap-1.5"
          >
            <FileText className="size-3.5" />
            {downloadingTxt ? "…" : "TXT"}
          </Button>
        </div>
      </header>

      {/* ── Editor body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={flushSave}
            placeholder="Start writing your cover letter…"
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            style={{ minHeight: "calc(100vh - 10rem)", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <CoverLetterPreviewModal
        id={id}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
