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
import { SectionCard } from "@/components/cv-editor/SectionCard";
import { SortableItemWrapper } from "@/components/cv-editor/SortableItemWrapper";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse, CvCertificateResponse, CvCertificateRequest } from "@/types/cv.types";

interface Props {
  cv: CvResponse;
}

type CertForm = Omit<CvCertificateRequest, "sortOrder">;

const EMPTY_FORM: CertForm = { name: "", issuer: "", issueDate: "", url: "" };

function CertificateFormRow({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: CertForm;
  onSave: (data: CertForm) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState<CertForm>(initial);

  function set<K extends keyof CertForm>(key: K, val: CertForm[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="space-y-2 rounded-lg border border-ring bg-muted/20 p-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Certificate Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="AWS Solutions Architect" autoFocus />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Issuer</Label>
          <Input value={form.issuer ?? ""} onChange={(e) => set("issuer", e.target.value)} placeholder="Amazon" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Issue Date</Label>
          <Input value={form.issueDate ?? ""} onChange={(e) => set("issueDate", e.target.value)} placeholder="Mar 2024" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">URL (optional)</Label>
          <Input value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="credly.com/..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" onClick={() => onSave(form)} disabled={saving || !form.name.trim()}>Save</Button>
      </div>
    </div>
  );
}

export function CertificatesSection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [items, setItems] = useState<CvCertificateResponse[]>(
    [...(cv.certificates ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function syncToCv(next: CvCertificateResponse[]) {
    setCv({ ...cv, certificates: next });
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
      cvApi.updateCertificate(cv.id, item.id, { ...item, sortOrder: item.sortOrder }).catch(() => {});
    });
  }

  async function handleAdd(form: CertForm) {
    setSaving(true);
    try {
      const { data } = await cvApi.createCertificate(cv.id, { ...form, sortOrder: items.length });
      const next = [...items, data];
      setItems(next);
      syncToCv(next);
      setIsAdding(false);
    } catch {
      toast.error("Failed to add certificate");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(item: CvCertificateResponse, form: CertForm) {
    setSaving(true);
    try {
      const { data } = await cvApi.updateCertificate(cv.id, item.id, { ...form, sortOrder: item.sortOrder });
      const next = items.map((i) => (i.id === item.id ? data : i));
      setItems(next);
      syncToCv(next);
      setEditingId(null);
    } catch {
      toast.error("Failed to save certificate");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    syncToCv(next);
    try {
      await cvApi.deleteCertificate(cv.id, id);
    } catch {
      toast.error("Failed to delete certificate");
    }
  }

  return (
    <SectionCard title="Certificates" onAdd={() => { setIsAdding(true); setEditingId(null); }}>
      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItemWrapper key={item.id} id={item.id}>
                {editingId === item.id ? (
                  <CertificateFormRow
                    initial={{ name: item.name, issuer: item.issuer, issueDate: item.issueDate, url: item.url }}
                    onSave={(form) => handleSave(item, form)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-muted/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[item.issuer, item.issueDate].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(item.id)}>
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
          <div className="ml-5">
            <CertificateFormRow
              initial={EMPTY_FORM}
              onSave={handleAdd}
              onCancel={() => setIsAdding(false)}
              saving={saving}
            />
          </div>
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-muted-foreground text-center py-4">No certificates yet. Click + to add one.</p>
        )}
      </div>
    </SectionCard>
  );
}
