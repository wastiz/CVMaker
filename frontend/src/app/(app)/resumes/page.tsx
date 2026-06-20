"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Copy, Download, Trash2, FileText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cvApi } from "@/api/cvApi";
import type { CvSummaryResponse } from "@/types/cv.types";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "classic", name: "Classic", description: "Traditional single-column layout" },
  { id: "minimal", name: "Minimal", description: "Clean design with generous whitespace" },
  { id: "sidebar", name: "Sidebar", description: "Two-column layout with sidebar" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Updated today";
  if (diff === 1) return "Updated yesterday";
  return `Updated ${diff} days ago`;
}

function templateLabel(id: string): string {
  return TEMPLATES.find((t) => t.id === id)?.name ?? id;
}

// ─── Create Modal ─────────────────────────────────────────────────────────────

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

// ─── Delete Confirmation ──────────────────────────────────────────────────────

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

// ─── CV Card ─────────────────────────────────────────────────────────────────

function CvCard({
  cv,
  onEdit,
  onDuplicate,
  onDownload,
  onDelete,
}: {
  cv: CvSummaryResponse;
  onEdit: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex-1">
        <h3 className="font-medium text-sm truncate">{cv.title}</h3>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {templateLabel(cv.templateId)}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{formatRelativeDate(cv.updatedAt)}</p>
      </div>

      <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
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
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onDownload}
          title="Download PDF"
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="size-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onDelete}
          title="Delete"
          className="ml-auto text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResumesPage() {
  const router = useRouter();
  const [cvs, setCvs] = useState<CvSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    cvApi
      .getAll()
      .then(({ data }) => setCvs(data))
      .catch(() => toast.error("Failed to load resumes"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(title: string, templateId: string) {
    const { data } = await cvApi.create({ title, templateId });
    setShowCreate(false);
    router.push(`/resumes/${data.id}`);
  }

  async function handleDuplicate(id: number) {
    try {
      const { data } = await cvApi.duplicate(id);
      setCvs((prev) => [...prev, { id: data.id, title: data.title, templateId: data.templateId, createdAt: data.createdAt, updatedAt: data.updatedAt }]);
      toast.success("Resume duplicated");
    } catch {
      toast.error("Failed to duplicate resume");
    }
  }

  async function handleDownload(id: number, title: string) {
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

  async function handleDelete(id: number) {
    setCvs((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    try {
      await cvApi.remove(id);
    } catch {
      toast.error("Failed to delete resume");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">My Resumes</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-border bg-muted/30 animate-pulse" />
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
          <Button className="mt-6" onClick={() => setShowCreate(true)}>
            <Plus className="size-4 mr-1.5" />
            Create Resume
          </Button>
        </div>

        <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Resumes</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* New Resume card — always first */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-transparent p-8 text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted/30 hover:text-foreground min-h-[9rem]"
        >
          <Plus className="size-7" />
          <span className="text-sm font-medium">New Resume</span>
        </button>

        {cvs.map((cv) => (
          <CvCard
            key={cv.id}
            cv={cv}
            onEdit={() => router.push(`/resumes/${cv.id}`)}
            onDuplicate={() => handleDuplicate(cv.id)}
            onDownload={() => handleDownload(cv.id, cv.title)}
            onDelete={() => setDeleteTarget({ id: cv.id, title: cv.title })}
          />
        ))}
      </div>

      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      <DeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
