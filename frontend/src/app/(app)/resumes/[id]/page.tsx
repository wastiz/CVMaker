"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CvEditor } from "@/components/cv-editor/CvEditor";
import { LanguageSwitcher } from "@/components/cv-editor/LanguageSwitcher";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { id: "classic", name: "Classic" },
  { id: "minimal", name: "Minimal" },
  { id: "sidebar", name: "Sidebar" },
] as const;

export default function CvEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { cv, isLoading, loadCv, setCv } = useCvStore();

  // Inline title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [savingTitle, setSavingTitle] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadCv(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  function startEditTitle() {
    if (!cv) return;
    setTitleDraft(cv.title);
    setEditingTitle(true);
  }

  async function commitTitle() {
    if (!cv || !titleDraft.trim()) {
      setEditingTitle(false);
      return;
    }
    if (titleDraft.trim() === cv.title) {
      setEditingTitle(false);
      return;
    }
    setSavingTitle(true);
    try {
      const { data } = await cvApi.update(cv.id, { title: titleDraft.trim() });
      setCv(data);
    } catch {
      toast.error("Failed to save title");
    } finally {
      setSavingTitle(false);
      setEditingTitle(false);
    }
  }

  async function handleTemplateChange(templateId: string) {
    if (!cv || cv.templateId === templateId) return;
    setSavingTemplate(true);
    try {
      const { data } = await cvApi.update(cv.id, { templateId });
      setCv(data);
    } catch {
      toast.error("Failed to update template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleDownloadPdf() {
    if (!cv) return;
    setDownloadingPdf(true);
    try {
      const { data } = await cvApi.getPdf(cv.id);
      const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cv.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }

  if (isLoading || !cv) {
    return (
      <div className="-m-6 flex h-screen flex-col overflow-hidden">
        {/* Skeleton header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <div className="h-7 w-7 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-48 rounded-md bg-muted animate-pulse" />
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const currentTemplate = TEMPLATES.find((t) => t.id === cv.templateId) ?? TEMPLATES[0];

  return (
    <div className="-m-6 flex flex-col overflow-hidden" style={{ height: "100vh" }}>
      {/* ── Fixed header ── */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => router.push("/resumes")}
          className="shrink-0"
          title="Back to resumes"
        >
          <ArrowLeft className="size-4" />
        </Button>

        {/* Editable title */}
        <div className="flex flex-1 items-center min-w-0">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") setEditingTitle(false);
              }}
              className="min-w-0 flex-1 truncate rounded-md border border-ring bg-transparent px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/50"
            />
          ) : (
            <button
              onClick={startEditTitle}
              className={cn(
                "truncate rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-muted",
                savingTitle && "opacity-50"
              )}
              title="Click to edit title"
            >
              {cv.title}
            </button>
          )}
        </div>

        {/* PDF language switcher */}
        <LanguageSwitcher cvId={cv.id} currentLang={cv.templateLanguage} />

        {/* Template selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={savingTemplate}
              />
            }
          >
            {currentTemplate.name}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TEMPLATES.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => handleTemplateChange(t.id)}
                className={cn(cv.templateId === t.id && "font-medium")}
              >
                {t.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export PDF */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="shrink-0 gap-1.5"
        >
          <Download className="size-3.5" />
          {downloadingPdf ? "Exporting…" : "Export PDF"}
        </Button>
      </header>

      {/* ── Editor body ── */}
      <CvEditor cv={cv} />
    </div>
  );
}
