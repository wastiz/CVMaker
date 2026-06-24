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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { SectionCard } from "@/components/cv-editor/SectionCard";
import { SortableItemWrapper } from "@/components/cv-editor/SortableItemWrapper";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse, CvSkillResponse, CvSkillRequest, SkillTypeKey } from "@/types/cv.types";
import { cn } from "@/lib/utils";

const SKILL_TYPES: SkillTypeKey[] = [
  "LANGUAGES", "FRAMEWORKS", "FRONTEND", "BACKEND",
  "DATABASES", "DEVOPS", "CLOUD", "TOOLS",
  "TESTING", "ARCHITECTURE", "METHODOLOGY",
  "SOFT", "MAIN", "HARD", "OTHER",
];

const SKILL_TYPE_LABELS: Record<SkillTypeKey, string> = {
  LANGUAGES: "Languages",
  FRAMEWORKS: "Frameworks",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASES: "Databases",
  DEVOPS: "DevOps",
  CLOUD: "Cloud",
  TOOLS: "Tools",
  TESTING: "Testing",
  ARCHITECTURE: "Architecture",
  METHODOLOGY: "Methodology",
  SOFT: "Soft skills",
  MAIN: "Main",
  HARD: "Hard skills",
  OTHER: "Other",
};

const TYPE_COLORS: Record<SkillTypeKey, string> = {
  LANGUAGES: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  FRAMEWORKS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  FRONTEND: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  BACKEND: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  DATABASES: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  DEVOPS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CLOUD: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  TOOLS: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  TESTING: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ARCHITECTURE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  METHODOLOGY: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  SOFT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MAIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  HARD: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  OTHER: "bg-muted text-muted-foreground",
};

interface Props {
  cv: CvResponse;
}

interface EditState {
  type: SkillTypeKey;
  name: string;
  showType: boolean;
}

export function SkillsSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvSkillResponse[]>(
    [...(cv.skills ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ type: "HARD", name: "", showType: true });
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<EditState>({ type: "HARD", name: "", showType: true });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function syncToCv(next: CvSkillResponse[]) {
    setCv({ ...cv, skills: next } as CvResponse);
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
      cvApi.updateSkill(cv.id, item.id, {
        type: item.type, name: item.name, sortOrder: item.sortOrder, showType: item.showType,
      }).catch(() => {});
    });
  }

  async function handleAdd() {
    if (!addForm.name.trim()) return;
    try {
      const { data } = await cvApi.createSkill(cv.id, {
        type: addForm.type,
        name: addForm.name.trim(),
        sortOrder: items.length,
        showType: addForm.showType,
      });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setAddForm({ type: "HARD", name: "", showType: true });
      setIsAdding(false);
    } catch {
      toast.error("Failed to add skill");
    }
  }

  function startEdit(item: CvSkillResponse) {
    setEditingId(item.id);
    setEditForm({ type: item.type, name: item.name, showType: item.showType });
  }

  async function handleSave(item: CvSkillResponse) {
    if (!editForm.name.trim()) return;
    try {
      const { data } = await cvApi.updateSkill(cv.id, item.id, {
        type: editForm.type,
        name: editForm.name.trim(),
        sortOrder: item.sortOrder,
        showType: editForm.showType,
      });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
      setEditingId(null);
    } catch {
      toast.error("Failed to save skill");
    }
  }

  async function handleToggleShowType(item: CvSkillResponse) {
    try {
      const { data } = await cvApi.updateSkill(cv.id, item.id, {
        type: item.type,
        name: item.name,
        sortOrder: item.sortOrder,
        showType: !item.showType,
      });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
    } catch {
      toast.error("Failed to update skill");
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
                  <div className="flex flex-col gap-2 rounded-lg border border-ring bg-muted/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <NativeSelect
                        value={editForm.type}
                        onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value as SkillTypeKey }))}
                        className="w-32 shrink-0"
                      >
                        {SKILL_TYPES.map((t) => (
                          <option key={t} value={t}>{SKILL_TYPE_LABELS[t]}</option>
                        ))}
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
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                      <Switch
                        checked={editForm.showType}
                        onCheckedChange={(v) => setEditForm((f) => ({ ...f, showType: v }))}
                      />
                      Show type in CV
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30 transition-colors group">
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium", TYPE_COLORS[item.type])}>
                      {SKILL_TYPE_LABELS[item.type]}
                    </span>
                    <span className="flex-1 text-sm truncate">{item.name}</span>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none shrink-0">
                      <Switch
                        checked={item.showType}
                        onCheckedChange={() => handleToggleShowType(item)}
                      />
                    </label>
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
          <div className="flex flex-col gap-2 rounded-lg border border-ring bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <NativeSelect
                value={addForm.type}
                onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value as SkillTypeKey }))}
                className="w-32 shrink-0"
              >
                {SKILL_TYPES.map((t) => (
                  <option key={t} value={t}>{SKILL_TYPE_LABELS[t]}</option>
                ))}
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
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <Switch
                checked={addForm.showType}
                onCheckedChange={(v) => setAddForm((f) => ({ ...f, showType: v }))}
              />
              Show type in CV
            </label>
          </div>
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground text-center py-4">No skills yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}
