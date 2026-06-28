"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { TemplateResponse } from "@/types/cv.types";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Props {
  cvId: number;
  currentTemplateId: string;
  disabled?: boolean;
}

export function TemplatePicker({ cvId, currentTemplateId, disabled }: Props) {
  const { setCv } = useCvStore();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cvApi
      .getTemplates()
      .then(({ data }) => setTemplates(data))
      .catch(() => {});
  }, []);

  const current = templates.find((t) => t.id === currentTemplateId);

  async function handleSelect(templateId: string) {
    if (templateId === currentTemplateId || saving) return;
    setSaving(true);
    try {
      const { data } = await cvApi.patch(cvId, { templateId });
      setCv(data);
      setOpen(false);
    } catch {
      toast.error("Failed to update template");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={disabled || saving}
          />
        }
      >
        {current?.name ?? currentTemplateId}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Template</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 pt-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              disabled={saving}
              className={cn(
                "group flex flex-col overflow-hidden rounded-xl text-left transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
                t.id === currentTemplateId
                  ? "ring-2 ring-primary"
                  : "ring-1 ring-foreground/10 hover:scale-[1.02]"
              )}
            >
              <img
                src={`${API_URL}${t.previewImageUrl}`}
                alt={t.name}
                className="w-full object-cover bg-muted"
                style={{ height: 226 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="px-3 py-2 bg-card border-t border-border">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
