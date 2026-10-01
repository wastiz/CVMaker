"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Copy, Download, FileJson, FileText, Trash2, Globe, Upload, Search, Braces, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cvApi } from "@/api/cvApi";
import type { CvSummaryResponse } from "@/types/cv.types";
import { downloadCvJson, importCvFromFile, CvImportError } from "@/lib/cvExportImport";
import { JsonTemplateModal } from "@/components/resumes/JsonTemplateModal";
import { TEMPLATES, filterCvs, languageLabel, templateLabel } from "@/lib/cvMeta";
import { cn } from "@/lib/utils";

function formatRelativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Updated today";
  if (diff === 1) return "Updated yesterday";
  return `Updated ${diff} days ago`;
}


function CreateModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, templateId: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("classic");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate(title.trim(), templateId);
      setTitle("");
      setTemplateId("classic");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Resume</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="resume-title">Resume Title</Label>
              <Input
                id="resume-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Developer CV"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      "rounded-lg border-2 p-3 text-left transition-all",
                      templateId === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-tight">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || saving}>
              {saving ? "Creating…" : "Create Resume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  target,
  onClose,
  onConfirm,
}: {
  target: { id: number; title: string } | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
}) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Resume</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">&ldquo;{target?.title}&rdquo;</span>? This
          action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => target && onConfirm(target.id)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CvCard({
  cv,
  onEdit,
  onDuplicate,
  onDownloadPdf,
  onExportJson,
  onDelete,
}: {
  cv: CvSummaryResponse;
  onEdit: () => void;
  onDuplicate: () => void;
  onDownloadPdf: () => void;
  onExportJson: () => void;
  onDelete: () => void;
}) {
  const fullName = [cv.firstName, cv.lastName].filter(Boolean).join(" ");
  const langLabel = cv.templateLanguage ? languageLabel(cv.templateLanguage) : null;

  return (
    <div className="group flex flex-col" style={{ aspectRatio: "210 / 297" }}>
      <div
        className="relative flex-1 flex flex-col rounded-lg border border-border bg-card shadow-sm cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
        onClick={onEdit}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 to-primary/30 shrink-0" />
        <div className="flex flex-col flex-1 px-4 pt-4 pb-3 min-h-0">
          <h3 className="font-semibold text-sm leading-snug">{cv.title}</h3>
          {fullName ? (
            <p className="mt-1 text-xs text-muted-foreground truncate">{fullName}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground/40 italic">No name</p>
          )}
          <div className="mt-3 h-px bg-border/60 shrink-0" />

          <div className="mt-3 flex-1 min-h-0">
            {cv.summary ? (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-[6]">
                {cv.summary}
              </p>
            ) : (
              <div className="space-y-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-muted/50"
                    style={{ width: i === 4 ? "55%" : "100%" }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                {templateLabel(cv.templateId)}
              </Badge>
              {langLabel && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                  <Globe className="size-2.5" />
                  {langLabel}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground truncate">
              {formatRelativeDate(cv.updatedAt)}
            </span>
          </div>
        </div>

        {/* Hover action overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-background/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card/95 px-2 py-1.5 shadow-md backdrop-blur-sm">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onEdit}
              title="Edit"
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onDuplicate}
              title="Duplicate"
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="size-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Download"
                    className="text-muted-foreground hover:text-foreground"
                  />
                }
              >
                <Download className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={onDownloadPdf}>
                  <FileText className="size-3.5" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJson}>
                  <FileJson className="size-3.5" />
                  Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-px h-4 bg-border mx-0.5" />
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onDelete}
              title="Delete"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumesPage() {
  const router = useRouter();
  const [cvs, setCvs] = useState<CvSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJsonTemplate, setShowJsonTemplate] = useState(false);
  const [query, setQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cvApi
      .getAll()
      .then(({ data }) => setCvs(data))
      .catch(() => toast.error("Failed to load resumes"))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => filterCvs(cvs, query), [cvs, query]);

  async function handleCreate(title: string, templateId: string) {
    const { data } = await cvApi.create({ title, templateId });
    setShowCreate(false);
    router.push(`/resumes/${data.id}`);
  }

  async function handleDuplicate(id: number) {
    try {
      const { data } = await cvApi.duplicate(id);
      setCvs((prev) => [...prev, data]);
      toast.success("Resume duplicated");
    } catch {
      toast.error("Failed to duplicate resume");
    }
  }

  async function handleDownloadPdf(id: number, title: string) {
    try {
      const { data } = await cvApi.getPdf(id);
      const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  }

  async function handleExportJson(id: number) {
    try {
      const { data } = await cvApi.getById(id);
      downloadCvJson(data);
    } catch {
      toast.error("Failed to export JSON");
    }
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsImporting(true);
    try {
      const imported = await importCvFromFile(file);
      toast.success("Resume imported");
      router.push(`/resumes/${imported.id}`);
    } catch (err) {
      toast.error(err instanceof CvImportError ? err.message : "Failed to import resume");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleDelete(id: number) {
    setCvs((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    try {
      await cvApi.remove(id);
    } catch {
      toast.error("Failed to delete resume");
    }
  }

  const importInput = (
    <input
      ref={importInputRef}
      type="file"
      accept="application/json,.json"
      className="hidden"
      onChange={handleImportFile}
    />
  );

  const jsonTemplateModal = (
    <JsonTemplateModal
      open={showJsonTemplate}
      onClose={() => setShowJsonTemplate(false)}
      onImported={(cv) => {
        setShowJsonTemplate(false);
        router.push(`/resumes/${cv.id}`);
      }}
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Resumes</h1>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-muted/30 animate-pulse"
              style={{ aspectRatio: "210 / 297" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Resumes</h1>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Plus className="size-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-medium">No resumes yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create your first resume to get started</p>
          <div className="mt-6 flex items-center gap-2">
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="size-4 mr-1.5" />
              Create Resume
            </Button>
            <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
              <Upload className="size-4 mr-1.5" />
              {isImporting ? "Importing…" : "Import JSON"}
            </Button>
            <Button variant="outline" onClick={() => setShowJsonTemplate(true)}>
              <Braces className="size-4 mr-1.5" />
              JSON template
            </Button>
          </div>
        </div>

        {importInput}
        {jsonTemplateModal}
        <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Resumes</h1>
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resumes…"
              aria-label="Search resumes"
              className="h-8 pl-8 pr-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isImporting}>
            <Upload className="size-3.5 mr-1.5" />
            {isImporting ? "Importing…" : "Import JSON"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowJsonTemplate(true)}>
            <Braces className="size-3.5 mr-1.5" />
            JSON template
          </Button>
        </div>
      </div>

      {query && (
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "No resumes match your search"
            : `${filtered.length} of ${cvs.length} resumes`}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {/* New Resume card — first when browsing; hidden while searching */}
        {!query && (
          <button
            onClick={() => setShowCreate(true)}
            style={{ aspectRatio: "210 / 297" }}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted/30 hover:text-foreground"
          >
            <Plus className="size-7" />
            <span className="text-sm font-medium">New Resume</span>
          </button>
        )}

        {filtered.map((cv) => (
          <CvCard
            key={cv.id}
            cv={cv}
            onEdit={() => router.push(`/resumes/${cv.id}`)}
            onDuplicate={() => handleDuplicate(cv.id)}
            onDownloadPdf={() => handleDownloadPdf(cv.id, cv.title)}
            onExportJson={() => handleExportJson(cv.id)}
            onDelete={() => setDeleteTarget({ id: cv.id, title: cv.title })}
          />
        ))}
      </div>

      {importInput}
      {jsonTemplateModal}
      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      <DeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
