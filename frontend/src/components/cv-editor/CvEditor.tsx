"use client";

import { useEffect, useRef, useState } from "react";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { SummarySection } from "./sections/SummarySection";
import { SkillsSection } from "./sections/SkillsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { EducationSection } from "./sections/EducationSection";
import { CertificatesSection } from "./sections/CertificatesSection";
import { SectionCard } from "./SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCvStore } from "@/store/cvStore";
import api from "@/lib/axios";
import type { CvResponse } from "@/types/cv.types";

// A4 at 96 dpi
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface Props {
  cv: CvResponse;
}

export function CvEditor({ cv }: Props) {
  const { previewTimestamp } = useCvStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Scale the A4 paper to fit the preview panel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleX = (width - 32) / A4_WIDTH;
      const scaleY = (height - 32) / A4_HEIGHT;
      setScale(Math.min(scaleX, scaleY, 1));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fetch HTML preview via Axios (Bearer token from Zustand is added automatically)
  useEffect(() => {
    if (!previewTimestamp) return;
    setPreviewLoading(true);
    api
      .get<string>(`/api/pdf/${cv.id}/preview`, { responseType: "text" })
      .then(({ data }) => setPreviewHtml(data))
      .catch(() => {})
      .finally(() => setPreviewLoading(false));
  }, [previewTimestamp, cv.id]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — editor forms */}
      <div className="w-2/5 overflow-y-auto border-r border-border p-4 space-y-3">
        <SectionCard title="Personal Info">
          <PersonalInfoSection cv={cv} />
        </SectionCard>
        <SummarySection cv={cv} />
        <SkillsSection cv={cv} />
        <LanguagesSection cv={cv} />
        <ExperienceSection cv={cv} />
        <ProjectsSection cv={cv} />
        <EducationSection cv={cv} />
        <CertificatesSection cv={cv} />
        <div className="h-8" />
      </div>

      {/* Right panel — live A4 preview */}
      <div
        ref={containerRef}
        className="flex-1 bg-muted/20 overflow-hidden flex items-start justify-center p-4"
      >
        <div
          className="relative bg-white shadow-xl ring-1 ring-black/5 flex-shrink-0"
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {previewLoading && (
            <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-none"
            title="CV Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
