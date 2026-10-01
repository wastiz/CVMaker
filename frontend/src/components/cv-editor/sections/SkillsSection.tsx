"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Check, X, ChevronLeft } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { SectionCard } from "@/components/cv-editor/SectionCard";
import { SortableItemWrapper } from "@/components/cv-editor/SortableItemWrapper";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse, CvSkillResponse } from "@/types/cv.types";
import {
  BUILT_IN_SKILL_TYPES,
  isBuiltInSkillType,
  normalizeSkillType,
  skillTypeColor,
  skillTypeLabel,
} from "@/lib/skillTypes";
import { cn } from "@/lib/utils";

const CUSTOM_OPTION = "__custom__";
const DEFAULT_TYPE = "HARD";
const MAX_TYPE_LENGTH = 50;

interface Props {
  cv: CvResponse;
}

interface EditState {
  type: string;
  name: string;
  showType: boolean;
}

/**
 * Type picker: the built-in list plus every custom type the user has created,
 * with a "New type…" entry that swaps the select for a free-text field.
 */
function TypePicker({
  value,
  customTypes,
  onChange,
}: {
  value: string;
  customTypes: string[];
  onChange: (type: string) => void;
}) {
  // A value that is not a known option can only have come from typing one.
  const [isTyping, setIsTyping] = useState(
    () => value !== "" && !isBuiltInSkillType(value) && !customTypes.includes(value)
  );

  if (isTyping) {
    return (
      <div className="flex w-40 shrink-0 items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          title="Back to the type list"
          onClick={() => {
            setIsTyping(false);
            onChange(DEFAULT_TYPE);
          }}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX_TYPE_LENGTH}
          placeholder="Type name"
          autoFocus
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <NativeSelect
      value={value}
      onChange={(e) => {
        if (e.target.value === CUSTOM_OPTION) {
          setIsTyping(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className="w-40 shrink-0"
    >
      <optgroup label="Built-in">
        {BUILT_IN_SKILL_TYPES.map((t) => (
          <option key={t} value={t}>
            {skillTypeLabel(t)}
          </option>
        ))}
      </optgroup>
      {customTypes.length > 0 && (
        <optgroup label="Your types">
          {customTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </optgroup>
      )}
      <optgroup label="—">
        <option value={CUSTOM_OPTION}>+ New type…</option>
      </optgroup>
    </NativeSelect>
  );
}

export function SkillsSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvSkillResponse[]>(
    [...(cv.skills ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ type: DEFAULT_TYPE, name: "", showType: true });
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<EditState>({ type: DEFAULT_TYPE, name: "", showType: true });
  // Custom types from the user's other CVs; types used in this one are merged in.
  const [savedCustomTypes, setSavedCustomTypes] = useState<string[]>([]);

  useEffect(() => {
    cvApi
      .listCustomSkillTypes()
      .then(({ data }) => setSavedCustomTypes(data))
      .catch(() => {});
  }, []);

  const customTypes = useMemo(() => {
    const used = items.map((i) => i.type).filter((t) => !isBuiltInSkillType(t));
    return [...new Set([...savedCustomTypes, ...used])].sort((a, b) => a.localeCompare(b));
  }, [savedCustomTypes, items]);

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
    const type = normalizeSkillType(addForm.type);
    if (!addForm.name.trim()) return;
    if (!type) {
      toast.error("Give the custom type a name");
      return;
    }
    try {
      const { data } = await cvApi.createSkill(cv.id, {
        type,
        name: addForm.name.trim(),
        sortOrder: items.length,
        showType: addForm.showType,
      });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setAddForm({ type: DEFAULT_TYPE, name: "", showType: true });
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
    const type = normalizeSkillType(editForm.type);
    if (!editForm.name.trim()) return;
    if (!type) {
      toast.error("Give the custom type a name");
      return;
    }
    try {
      const { data } = await cvApi.updateSkill(cv.id, item.id, {
        type,
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

  /** Renames a custom type everywhere it is used in this CV. */
  async function handleRenameType(from: string, to: string) {
    const target = normalizeSkillType(to);
    if (!target || target === from) return;
    const affected = items.filter((i) => i.type === from);
    const next = items.map((i) => (i.type === from ? { ...i, type: target } : i));
    setItems(next);
    syncToCv(next);
    setSavedCustomTypes((prev) => prev.filter((t) => t !== from));
    try {
      await Promise.all(
        affected.map((i) =>
          cvApi.updateSkill(cv.id, i.id, {
            type: target, name: i.name, sortOrder: i.sortOrder, showType: i.showType,
          })
        )
      );
    } catch {
      toast.error("Failed to rename type");
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
                      <TypePicker
                        value={editForm.type}
                        customTypes={customTypes}
                        onChange={(type) => setEditForm((f) => ({ ...f, type }))}
                      />
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
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium", skillTypeColor(item.type))}>
                      {skillTypeLabel(item.type)}
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
              <TypePicker
                value={addForm.type}
                customTypes={customTypes}
                onChange={(type) => setAddForm((f) => ({ ...f, type }))}
              />
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

        {customTypes.length > 0 && (
          <CustomTypeManager types={customTypes} items={items} onRename={handleRenameType} />
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground text-center py-4">No skills yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}

/** Lists the user's custom types and lets them be renamed across this CV. */
function CustomTypeManager({
  types,
  items,
  onRename,
}: {
  types: string[];
  items: CvSkillResponse[];
  onRename: (from: string, to: string) => void;
}) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function commit(from: string) {
    onRename(from, draft);
    setRenaming(null);
  }

  return (
    <div className="mt-3 rounded-lg border border-dashed border-border px-3 py-2">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Your custom types</p>
      <div className="flex flex-wrap gap-1.5">
        {types.map((t) =>
          renaming === t ? (
            <div key={t} className="flex items-center gap-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit(t);
                  if (e.key === "Escape") setRenaming(null);
                }}
                maxLength={MAX_TYPE_LENGTH}
                autoFocus
                className="h-7 w-36"
              />
              <Button size="icon-sm" variant="ghost" onClick={() => commit(t)}>
                <Check className="size-3.5 text-emerald-600" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => setRenaming(null)}>
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <button
              key={t}
              type="button"
              title={
                items.some((i) => i.type === t)
                  ? "Rename this type in this CV"
                  : "Used in your other CVs — renaming affects this CV only"
              }
              onClick={() => { setRenaming(t); setDraft(t); }}
              className={cn(
                "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80",
                skillTypeColor(t),
                !items.some((i) => i.type === t) && "opacity-60"
              )}
            >
              {t}
              <Pencil className="size-2.5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
