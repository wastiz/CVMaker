"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
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
import { NativeSelect } from "@/components/ui/NativeSelect";
import { SectionCard } from "@/components/cv-editor/SectionCard";
import { SortableItemWrapper } from "@/components/cv-editor/SortableItemWrapper";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse, CvSkillResponse, CvSkillRequest } from "@/types/cv.types";
import { cn } from "@/lib/utils";

const SKILL_TYPES = ["SOFT", "MAIN", "HARD", "OTHER"] as const;
const TYPE_LABELS: Record<string, string> = {
  SOFT: "Soft",
  MAIN: "Main",
  HARD: "Hard",
  OTHER: "Other",
};
const TYPE_COLORS: Record<string, string> = {
  SOFT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MAIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  HARD: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  OTHER: "bg-muted text-muted-foreground",
};

interface Props {
  cv: CvResponse;
}

interface EditState {
  type: CvSkillRequest["type"];
  name: string;
}

export function SkillsSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvSkillResponse[]>([...(cv.skills ?? [])].sort((a, b) => a.sortOrder - b.sortOrder));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ type: "HARD", name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<EditState>({ type: "HARD", name: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function syncToCv(next: CvSkillResponse[]) {
    const cv2 = { ...cv, skills: next };
    setCv(cv2 as CvResponse);
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
      cvApi.updateSkill(cv.id, item.id, { type: item.type, name: item.name, sortOrder: item.sortOrder }).catch(() => {});
    });
  }

  async function handleAdd() {
    if (!addForm.name.trim()) return;
    try {
      const { data } = await cvApi.createSkill(cv.id, {
        type: addForm.type,
        name: addForm.name.trim(),
        sortOrder: items.length,
      });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setAddForm({ type: "HARD", name: "" });
      setIsAdding(false);
    } catch {
      toast.error("Failed to add skill");
    }
  }

  function startEdit(item: CvSkillResponse) {
    setEditingId(item.id);
    setEditForm({ type: item.type, name: item.name });
  }

  async function handleSave(item: CvSkillResponse) {
    if (!editForm.name.trim()) return;
    try {
      const { data } = await cvApi.updateSkill(cv.id, item.id, {
        type: editForm.type,
        name: editForm.name.trim(),
        sortOrder: item.sortOrder,
      });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
      setEditingId(null);
    } catch {
      toast.error("Failed to save skill");
    }
  }

  async function handleDelete(id: number) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    syncToCv(next);
    try {
      await cvApi.deleteSkill(cv.id, id);
    } catch {
      toast.error("Failed to delete skill");
    }
  }

  return (
    <SectionCard title="Skills" onAdd={() => { setIsAdding(true); setEditingId(null); }}>
      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItemWrapper key={item.id} id={item.id}>
                {editingId === item.id ? (
                  <div className="flex items-center gap-2 rounded-lg border border-ring bg-muted/30 px-3 py-2">
                    <NativeSelect
                      value={editForm.type}
                      onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value as CvSkillRequest["type"] }))}
                      className="w-24 shrink-0"
                    >
                      {SKILL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </NativeSelect>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleSave(item)}
                      autoFocus
                      className="flex-1"
                    />
                    <Button size="icon-sm" variant="ghost" onClick={() => handleSave(item)}>
                      <Check className="size-3.5 text-emerald-600" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30 transition-colors group">
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium", TYPE_COLORS[item.type])}>
                      {TYPE_LABELS[item.type]}
                    </span>
                    <span className="flex-1 text-sm truncate">{item.name}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon-sm" variant="ghost" onClick={() => startEdit(item)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </SortableItemWrapper>
            ))}
          </SortableContext>
        </DndContext>

        {isAdding && (
          <div className="flex items-center gap-2 rounded-lg border border-ring bg-muted/30 px-3 py-2">
            <NativeSelect
              value={addForm.type}
              onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value as CvSkillRequest["type"] }))}
              className="w-24 shrink-0"
            >
              {SKILL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </NativeSelect>
            <Input
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Skill name"
              autoFocus
              className="flex-1"
            />
            <Button size="icon-sm" variant="ghost" onClick={handleAdd}>
              <Check className="size-3.5 text-emerald-600" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setIsAdding(false)}>
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground text-center py-4">No skills yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}
