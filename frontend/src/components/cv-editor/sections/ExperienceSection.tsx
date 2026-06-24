"use client";

import { useState } from "react";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
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
import type { CvResponse, CvExperienceResponse, CvExperienceRequest } from "@/types/cv.types";
import { cn } from "@/lib/utils";

interface Props {
  cv: CvResponse;
}

type ExpForm = Omit<CvExperienceRequest, "sortOrder">;

const EMPTY_FORM: ExpForm = {
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  stack: [],
};

function ExperienceForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ExpForm;
  onSave: (data: ExpForm) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState<ExpForm>(initial);

  function set<K extends keyof ExpForm>(key: K, val: ExpForm[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="space-y-3 rounded-lg border border-ring bg-muted/20 p-3 mt-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Company</Label>
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Position</Label>
          <Input value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="Senior Engineer" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Location</Label>
        <Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="Tallinn, Estonia" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Start Date</Label>
          <Input value={form.startDate} onChange={(e) => set("startDate", e.target.value)} placeholder="Jan 2022" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">End Date</Label>
          <Input
            value={form.endDate ?? ""}
            onChange={(e) => set("endDate", e.target.value)}
            placeholder="Dec 2024"
            disabled={form.isCurrent}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.isCurrent}
          onChange={(e) => { set("isCurrent", e.target.checked); if (e.target.checked) set("endDate", ""); }}
          className="rounded"
        />
        I currently work here
      </label>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe your responsibilities and achievements..."
          className="min-h-20 resize-none"
        />
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

export function ExperienceSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvExperienceResponse[]>(
    [...(cv.experience ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function syncToCv(next: CvExperienceResponse[]) {
    setCv({ ...cv, experience: next });
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
      cvApi.updateExperience(cv.id, item.id, { ...item, sortOrder: item.sortOrder }).catch(() => {});
    });
  }

  async function handleAdd(form: ExpForm) {
    setSaving(true);
    try {
      const { data } = await cvApi.createExperience(cv.id, { ...form, sortOrder: items.length });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setIsAdding(false);
    } catch {
      toast.error("Failed to add experience");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(item: CvExperienceResponse, form: ExpForm) {
    setSaving(true);
    try {
      const { data } = await cvApi.updateExperience(cv.id, item.id, { ...form, sortOrder: item.sortOrder });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
      setExpandedId(null);
    } catch {
      toast.error("Failed to save experience");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    syncToCv(next);
    try {
      await cvApi.deleteExperience(cv.id, id);
    } catch {
      toast.error("Failed to delete experience");
    }
  }

  return (
    <SectionCard title="Experience" onAdd={() => { setIsAdding(true); setExpandedId(null); }}>
      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => {
              const isOpen = expandedId === item.id;
              return (
                <SortableItemWrapper key={item.id} id={item.id}>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors",
                        isOpen && "bg-muted/30"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.position || <span className="text-muted-foreground italic">Untitled</span>}
                          {item.company && <span className="font-normal text-muted-foreground"> @ {item.company}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.startDate} – {item.isCurrent ? "Present" : item.endDate ?? ""}
                        </p>
                      </div>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                      >
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
                        <ExperienceForm
                          initial={{
                            company: item.company,
                            position: item.position,
                            location: item.location,
                            startDate: item.startDate,
                            endDate: item.endDate,
                            isCurrent: item.isCurrent,
                            description: item.description,
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
            <ExperienceForm
              initial={EMPTY_FORM}
              onSave={handleAdd}
              onCancel={() => setIsAdding(false)}
              saving={saving}
            />
          </div>
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground text-center py-4">No experience yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}
