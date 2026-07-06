"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { coverLetterApi, type CoverLetter } from "@/api/coverLetterApi";

function formatRelativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Updated today";
  if (diff === 1) return "Updated yesterday";
  return `Updated ${diff} days ago`;
}

function CoverLetterCard({
  letter,
  onOpen,
  onDelete,
}: {
  letter: CoverLetter;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
      onClick={onOpen}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium">{letter.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeDate(letter.updatedAt)}
        </p>
      </div>
      <Button
        size="icon-sm"
        variant="ghost"
        title="Delete"
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
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
          <DialogTitle>Delete Cover Letter</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">
            &ldquo;{target?.title}&rdquo;
          </span>
          ? This action cannot be undone.
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

export default function CoverLettersPage() {
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    coverLetterApi
      .list()
      .then(({ data }) => setLetters(data))
      .catch(() => toast.error("Failed to load cover letters"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const { data } = await coverLetterApi.create({
        title: "New Cover Letter",
        content: "Start writing your cover letter here...",
      });
      router.push(`/cover-letters/${data.id}`);
    } catch {
      toast.error("Failed to create cover letter");
      setIsCreating(false);
    }
  }

  async function handleDelete(id: number) {
    setLetters((prev) => prev.filter((l) => l.id !== id));
    setDeleteTarget(null);
    try {
      await coverLetterApi.delete(id);
    } catch {
      toast.error("Failed to delete cover letter");
      coverLetterApi.list().then(({ data }) => setLetters(data)).catch(() => {});
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
        <div className="max-w-2xl space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl border border-border bg-muted/30"
            />
          ))}
        </div>
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-medium">No cover letters yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first cover letter to get started
          </p>
          <Button
            className="mt-6 gap-1.5"
            onClick={handleCreate}
            disabled={isCreating}
          >
            <Plus className="size-4" />
            {isCreating ? "Creating…" : "New Cover Letter"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
        <Button onClick={handleCreate} disabled={isCreating} className="gap-1.5">
          <Plus className="size-4" />
          {isCreating ? "Creating…" : "New Cover Letter"}
        </Button>
      </div>

      <div className="space-y-2">
        {letters.map((letter) => (
          <CoverLetterCard
            key={letter.id}
            letter={letter}
            onOpen={() => router.push(`/cover-letters/${letter.id}`)}
            onDelete={() => setDeleteTarget({ id: letter.id, title: letter.title })}
          />
        ))}
      </div>

      <DeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
