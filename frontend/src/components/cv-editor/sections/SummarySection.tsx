"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/cv-editor/SectionCard";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import type { CvResponse } from "@/types/cv.types";

interface Props {
  cv: CvResponse;
}

export function SummarySection({ cv }: Props) {
  const { setCv } = useCvStore();
  const [value, setValue] = useState(cv.summary ?? "");

  async function handleBlur() {
    try {
      const { data } = await cvApi.patch(cv.id, { summary: value || undefined });
      setCv(data);
    } catch {
      toast.error("Failed to save");
    }
  }

  return (
    <SectionCard title="Summary">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="A brief professional summary about yourself..."
        className="min-h-24 resize-none"
      />
    </SectionCard>
  );
}
