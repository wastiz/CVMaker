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
import type { CvResponse, CvLanguageResponse } from "@/types/cv.types";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];

interface Props {
  cv: CvResponse;
}

interface FormState {
  language: string;
  level: string;
}

export function LanguagesSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvLanguageResponse[]>(
    [...(cv.languages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ language: "", level: "B2" });
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<FormState>({ language: "", level: "B2" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function syncToCv(next: CvLanguageResponse[]) {
    setCv({ ...cv, languages: next });
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
      cvApi.updateLanguage(cv.id, item.id, { language: item.language, level: item.level, sortOrder: item.sortOrder }).catch(() => {});
    });
  }

  async function handleAdd() {
    if (!addForm.language.trim()) return;
    try {
      const { data } = await cvApi.createLanguage(cv.id, {
        language: addForm.language.trim(),
        level: addForm.level,
        sortOrder: items.length,
      });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setAddForm({ language: "", level: "B2" });
      setIsAdding(false);
    } catch {
      toast.error("Failed to add language");
    }
  }

  function startEdit(item: CvLanguageResponse) {
    setEditingId(item.id);
    setEditForm({ language: item.language, level: item.level });
  }

  async function handleSave(item: CvLanguageResponse) {
    if (!editForm.language.trim()) return;
    try {
      const { data } = await cvApi.updateLanguage(cv.id, item.id, {
        language: editForm.language.trim(),
        level: editForm.level,
        sortOrder: item.sortOrder,
      });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
      setEditingId(null);
    } catch {
      toast.error("Failed to save language");
    }
  }

  async function handleDelete(id: number) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    syncToCv(next);
    try {
      await cvApi.deleteLanguage(cv.id, id);
    } catch {
      toast.error("Failed to delete language");
    }
  }

  return (
    <SectionCard title="Languages" onAdd={() => { setIsAdding(true); setEditingId(null); }}>
      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItemWrapper key={item.id} id={item.id}>
                {editingId === item.id ? (
                  <div className="flex items-center gap-2 rounded-lg border border-ring bg-muted/30 px-3 py-2">
                    <Input
                      value={editForm.language}
                      onChange={(e) => setEditForm((f) => ({ ...f, language: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleSave(item)}
                      placeholder="Language"
                      autoFocus
                      className="flex-1"
                    />
                    <NativeSelect
                      value={editForm.level}
                      onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))}
                      className="w-24 shrink-0"
                    >
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </NativeSelect>
                    <Button size="icon-sm" variant="ghost" onClick={() => handleSave(item)}>
                      <Check className="size-3.5 text-emerald-600" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30 transition-colors group">
                    <span className="flex-1 text-sm font-medium">{item.language}</span>
                    <span className="text-xs text-muted-foreground">{item.level}</span>
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
            <Input
              value={addForm.language}
              onChange={(e) => setAddForm((f) => ({ ...f, language: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Language"
              autoFocus
              className="flex-1"
            />
            <NativeSelect
              value={addForm.level}
              onChange={(e) => setAddForm((f) => ({ ...f, level: e.target.value }))}
              className="w-24 shrink-0"
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </NativeSelect>
            <Button size="icon-sm" variant="ghost" onClick={handleAdd}>
              <Check className="size-3.5 text-emerald-600" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setIsAdding(false)}>
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground text-center py-4">No languages yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}
