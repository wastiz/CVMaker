"use client";

import { useState } from "react";
import { Pencil, Trash2, ChevronDown, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/TagInput";
import { SectionCard } from "@/components/cv-editor/SectionCard";
import { SortableItemWrapper } from "@/components/cv-editor/SortableItemWrapper";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse, CvProjectResponse, CvProjectRequest } from "@/types/cv.types";
import { cn } from "@/lib/utils";

interface Props {
  cv: CvResponse;
}

type ProjForm = Omit<CvProjectRequest, "sortOrder">;

const EMPTY_FORM: ProjForm = {
  name: "",
  url: "",
  description: "",
  bulletPoints: [],
  stack: [],
};

function ProjectForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ProjForm;
  onSave: (data: ProjForm) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState<ProjForm>(initial);

  function set<K extends keyof ProjForm>(key: K, val: ProjForm[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addBullet() {
    set("bulletPoints", [...(form.bulletPoints ?? []), ""]);
  }

  function updateBullet(idx: number, val: string) {
    const pts = [...(form.bulletPoints ?? [])];
    pts[idx] = val;
    set("bulletPoints", pts);
  }

  function removeBullet(idx: number) {
    set("bulletPoints", (form.bulletPoints ?? []).filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3 rounded-lg border border-ring bg-muted/20 p-3 mt-1">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Project Name</Label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="My Awesome Project" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">URL (optional)</Label>
        <Input value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="github.com/user/repo" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Short project description..."
          className="min-h-16 resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Bullet Points</Label>
          <Button type="button" size="icon-xs" variant="ghost" onClick={addBullet}>
            <Plus className="size-3" />
          </Button>
        </div>
        <div className="space-y-1.5">
          {(form.bulletPoints ?? []).map((pt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={pt}
                onChange={(e) => updateBullet(idx, e.target.value)}
                placeholder={`Point ${idx + 1}`}
                className="flex-1"
              />
              <Button type="button" size="icon-sm" variant="ghost" onClick={() => removeBullet(idx)}>
                <X className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          {(form.bulletPoints ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">No bullet points. Click + to add.</p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Tech Stack</Label>
        <TagInput
          tags={form.stack ?? []}
          onChange={(tags) => set("stack", tags)}
          placeholder="Add technology and press Enter"
        />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" onClick={() => onSave(form)} disabled={saving}>Save</Button>
      </div>
    </div>
  );
}

export function ProjectsSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvProjectResponse[]>(
    [...(cv.projects ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function syncToCv(next: CvProjectResponse[]) {
    setCv({ ...cv, projects: next });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx).map((item, idx) => ({ ...item, sortOrder: idx }));
    setItems(reordered);
    syncToCv(reordered);
    reordered.forEach((item) => {
      cvApi.updateProject(cv.id, item.id, { ...item, sortOrder: item.sortOrder }).catch(() => {});
    });
  }

  async function handleAdd(form: ProjForm) {
    setSaving(true);
    try {
      const { data } = await cvApi.createProject(cv.id, { ...form, sortOrder: items.length });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setIsAdding(false);
    } catch {
      toast.error("Failed to add project");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(item: CvProjectResponse, form: ProjForm) {
    setSaving(true);
    try {
      const { data } = await cvApi.updateProject(cv.id, item.id, { ...form, sortOrder: item.sortOrder });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
      setExpandedId(null);
    } catch {
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    syncToCv(next);
    try {
      await cvApi.deleteProject(cv.id, id);
    } catch {
      toast.error("Failed to delete project");
    }
  }

  return (
    <SectionCard title="Projects" onAdd={() => { setIsAdding(true); setExpandedId(null); }}>
      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => {
              const isOpen = expandedId === item.id;
              return (
                <SortableItemWrapper key={item.id} id={item.id}>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className={cn("flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors", isOpen && "bg-muted/30")}>
                      <p className="flex-1 text-sm font-medium truncate">
                        {item.name || <span className="text-muted-foreground italic">Untitled</span>}
                      </p>
                      <Button size="icon-sm" variant="ghost" onClick={() => setExpandedId(isOpen ? null : item.id)}>
                        <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setExpandedId(isOpen ? null : item.id)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                    {isOpen && (
                      <div className="border-t border-border px-3 pb-3">
                        <ProjectForm
                          initial={{
                            name: item.name,
                            url: item.url,
                            description: item.description,
                            bulletPoints: item.bulletPoints ?? [],
                            stack: item.stack ?? [],
                          }}
                          onSave={(form) => handleSave(item, form)}
                          onCancel={() => setExpandedId(null)}
                          saving={saving}
                        />
                      </div>
                    )}
                  </div>
                </SortableItemWrapper>
              );
            })}
          </SortableContext>
        </DndContext>

        {isAdding && (
          <div className="ml-5">
            <ProjectForm
              initial={EMPTY_FORM}
              onSave={handleAdd}
              onCancel={() => setIsAdding(false)}
              saving={saving}
            />
          </div>
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground text-center py-4">No projects yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}
