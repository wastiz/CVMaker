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
import { SectionCard } from "@/components/cv-editor/SectionCard";
import { SortableItemWrapper } from "@/components/cv-editor/SortableItemWrapper";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse, CvStrengthResponse } from "@/types/cv.types";

interface Props {
  cv: CvResponse;
}

export function StrengthsSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvStrengthResponse[]>(
    [...(cv.strengths ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addName, setAddName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function syncToCv(next: CvStrengthResponse[]) {
    setCv({ ...cv, strengths: next });
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
      cvApi.updateStrength(cv.id, item.id, { name: item.name, sortOrder: item.sortOrder }).catch(() => {});
    });
  }

  async function handleAdd() {
    if (!addName.trim()) return;
    try {
      const { data } = await cvApi.createStrength(cv.id, {
        name: addName.trim(),
        sortOrder: items.length,
      });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setAddName("");
      setIsAdding(false);
    } catch {
      toast.error("Failed to add strength");
    }
  }

  function startEdit(item: CvStrengthResponse) {
    setEditingId(item.id);
    setEditName(item.name);
  }

  async function handleSave(item: CvStrengthResponse) {
    if (!editName.trim()) return;
    try {
      const { data } = await cvApi.updateStrength(cv.id, item.id, {
        name: editName.trim(),
        sortOrder: item.sortOrder,
      });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
      setEditingId(null);
    } catch {
      toast.error("Failed to save strength");
    }
  }

  async function handleDelete(id: number) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    syncToCv(next);
    try {
      await cvApi.deleteStrength(cv.id, id);
    } catch {
      toast.error("Failed to delete strength");
    }
  }

  return (
    <SectionCard title="Strengths" onAdd={() => { setIsAdding(true); setEditingId(null); }}>
      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItemWrapper key={item.id} id={item.id}>
                {editingId === item.id ? (
                  <div className="flex items-center gap-2 rounded-lg border border-ring bg-muted/30 px-3 py-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
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
            <Input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Fast learner"
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
          <p className="text-xs text-muted-foreground text-center py-4">No strengths yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}
