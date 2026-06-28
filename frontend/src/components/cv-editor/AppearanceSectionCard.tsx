"use client";

import { useState } from "react";
import { toast } from "sonner";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { SectionCard } from "./SectionCard";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse } from "@/types/cv.types";

const FONTS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "lato", label: "Lato" },
  { value: "merriweather", label: "Merriweather" },
  { value: "sourcecodepro", label: "Source Code Pro" },
];

const SIZES = [9, 10, 11, 12];

interface Props {
  cv: CvResponse;
}

export function AppearanceSectionCard({ cv }: Props) {
  const { setCv } = useCvStore();
  const [saving, setSaving] = useState(false);

  async function handleChange(field: "fontFamily" | "fontSizePt", value: string | number) {
    if (saving) return;
    setSaving(true);
    try {
      const patch =
        field === "fontSizePt"
          ? { fontSizePt: Number(value) }
          : { fontFamily: value as string };
      const { data } = await cvApi.patch(cv.id, patch);
      setCv(data);
    } catch {
      toast.error("Failed to update appearance");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="Appearance">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-muted-foreground mb-1">Font</label>
          <NativeSelect
            value={cv.fontFamily ?? "inter"}
            onChange={(e) => handleChange("fontFamily", e.target.value)}
            disabled={saving}
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div style={{ width: 84 }}>
          <label className="block text-xs text-muted-foreground mb-1">Size</label>
          <NativeSelect
            value={cv.fontSizePt ?? 10}
            onChange={(e) => handleChange("fontSizePt", e.target.value)}
            disabled={saving}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}pt
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
    </SectionCard>
  );
}
