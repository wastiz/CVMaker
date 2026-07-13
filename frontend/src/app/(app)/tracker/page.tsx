"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Minus,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackerApi } from "@/api/trackerApi";
import { notesApi } from "@/api/notesApi";
import type {
  JobTrackerStats,
  Note,
  NoteType,
  NoteCreateRequest,
  NoteUpdateRequest,
  StatKey,
  TrackerField,
  TrackerAction,
} from "@/types/tracker.types";
import { cn } from "@/lib/utils";

// ─── Stat config ─────────────────────────────────────────────────────────────

const STAT_CONFIGS: Array<{ key: StatKey; label: string; field: TrackerField }> = [
  { key: "applied",    label: "Applied",    field: "APPLIED"    },
  { key: "rejections", label: "Rejections", field: "REJECTIONS" },
  { key: "interviews", label: "Interviews", field: "INTERVIEWS" },
  { key: "offers",     label: "Offers",     field: "OFFERS"     },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-5xl font-bold tabular-nums tracking-tight">{value}</p>
      <div className="flex items-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={onDecrement}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={onIncrement}
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const actions = (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <Button size="icon-sm" variant="ghost" onClick={onEdit} title="Edit">
        <Pencil className="size-3.5" />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={onDelete}
        title="Delete"
        className="hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );

  if (note.type === "JOB_LINK") {
    return (
      <div className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/20">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
          <Link2 className="size-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          {note.companyName && (
            <p className="truncate text-sm font-medium">{note.companyName}</p>
          )}
          {note.title && (
            <p className="truncate text-xs text-muted-foreground">{note.title}</p>
          )}
          {note.url && (
            <a
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 truncate text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3 shrink-0" />
              <span className="truncate">{note.url}</span>
            </a>
          )}
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/20">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        {note.title && (
          <p className="truncate text-sm font-medium">{note.title}</p>
        )}
        {note.content && (
          <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
            {note.content}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}

// ─── Note Modal ───────────────────────────────────────────────────────────────

type NoteFormState = {
  type: NoteType;
  title: string;
  companyName: string;
  url: string;
  content: string;
};

function NoteModal({
  open,
  note,
  onClose,
  onSave,
}: {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (data: NoteCreateRequest | NoteUpdateRequest, id?: number) => Promise<void>;
}) {
  const isEdit = !!note;
  const [form, setForm] = useState<NoteFormState>({
    type: "FREE",
    title: "",
    companyName: "",
    url: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        type: note?.type ?? "FREE",
        title: note?.title ?? "",
        companyName: note?.companyName ?? "",
        url: note?.url ?? "",
        content: note?.content ?? "",
      });
      setSaving(false);
    }
  }, [open, note]);

  const activeType = isEdit ? note!.type : form.type;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        const data: NoteUpdateRequest = {
          title: form.title || undefined,
          ...(note!.type === "JOB_LINK"
            ? { companyName: form.companyName || undefined, url: form.url || undefined }
            : { content: form.content || undefined }),
        };
        await onSave(data, note!.id);
      } else {
        const data: NoteCreateRequest = {
          type: form.type,
          title: form.title || undefined,
          ...(form.type === "JOB_LINK"
            ? { companyName: form.companyName || undefined, url: form.url || undefined }
            : { content: form.content || undefined }),
        };
        await onSave(data);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Note" : "Add Note"}</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {!isEdit && (
              <div className="flex gap-2">
                {(["FREE", "JOB_LINK"] as NoteType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={cn(
                      "flex-1 rounded-lg border-2 px-3 py-2 text-center text-sm font-medium transition-all",
                      form.type === t
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    {t === "FREE" ? "Free Note" : "Job Link"}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={
                  activeType === "JOB_LINK" ? "e.g. Junior Developer" : "Note title"
                }
                autoFocus
              />
            </div>

            {activeType === "JOB_LINK" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="note-company">Company</Label>
                  <Input
                    id="note-company"
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="note-url">Job URL</Label>
                  <Input
                    id="note-url"
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Note content…"
                  className="min-h-28 resize-none"
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteNoteDialog({
  note,
  onClose,
  onConfirm,
}: {
  note: Note | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
}) {
  return (
    <Dialog open={!!note} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this note? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => note && onConfirm(note.id)}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackerPage() {
  const [stats, setStats] = useState<JobTrackerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  useEffect(() => {
    trackerApi
      .get()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error("Failed to load tracker stats"))
      .finally(() => setStatsLoading(false));

    notesApi
      .list()
      .then(({ data }) => setNotes(data))
      .catch(() => toast.error("Failed to load notes"))
      .finally(() => setNotesLoading(false));
  }, []);

  function handlePatch(field: TrackerField, action: TrackerAction, key: StatKey) {
    if (!stats) return;
    const prev = stats[key];
    const next = action === "INCREMENT" ? prev + 1 : Math.max(0, prev - 1);

    setStats((s) => (s ? { ...s, [key]: next } : s));

    trackerApi
      .patch({ field, action })
      .then(({ data }) => setStats(data))
      .catch(() => {
        toast.error("Failed to update tracker");
        setStats((s) => (s ? { ...s, [key]: prev } : s));
      });
  }

  async function handleNoteModalSave(
    data: NoteCreateRequest | NoteUpdateRequest,
    id?: number
  ) {
    if (id !== undefined) {
      const { data: updated } = await notesApi.update(id, data as NoteUpdateRequest);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      toast.success("Note updated");
    } else {
      const { data: created } = await notesApi.create(data as NoteCreateRequest);
      setNotes((prev) => [created, ...prev]);
      toast.success("Note added");
    }
  }

  async function handleDeleteNote(id: number) {
    setDeleteTarget(null);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.delete(id);
    } catch {
      toast.error("Failed to delete note");
      notesApi.list().then(({ data }) => setNotes(data)).catch(() => {});
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Job Tracker</h1>

      {/* ── Stats ── */}
      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Application Stats
        </p>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAT_CONFIGS.map(({ key, label, field }) => (
              <StatCard
                key={key}
                label={label}
                value={stats[key]}
                onIncrement={() => handlePatch(field, "INCREMENT", key)}
                onDecrement={() => handlePatch(field, "DECREMENT", key)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Could not load stats.</p>
        )}
      </section>

      {/* ── Notes ── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Notes
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => { setEditingNote(null); setNoteModalOpen(true); }}
          >
            <Plus className="size-3.5" />
            Add Note
          </Button>
        </div>

        {notesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <h3 className="mt-3 text-sm font-medium">No notes yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Save job links or free-form notes about your search.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 gap-1.5"
              onClick={() => { setEditingNote(null); setNoteModalOpen(true); }}
            >
              <Plus className="size-3.5" />
              Add Note
            </Button>
          </div>
        ) : (
          <div className="space-y-2 grid grid-cols-4 gap-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => { setEditingNote(note); setNoteModalOpen(true); }}
                onDelete={() => setDeleteTarget(note)}
              />
            ))}
          </div>
        )}
      </section>

      <NoteModal
        open={noteModalOpen}
        note={editingNote}
        onClose={() => { setNoteModalOpen(false); setEditingNote(null); }}
        onSave={handleNoteModalSave}
      />

      <DeleteNoteDialog
        note={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteNote}
      />
    </div>
  );
}
