"use client";

import { useEffect, useRef, useState } from "react";
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
import { AppearanceSectionCard } from "./AppearanceSectionCard";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { SummarySection } from "./sections/SummarySection";
import { SkillsSection } from "./sections/SkillsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { EducationSection } from "./sections/EducationSection";
import { CertificatesSection } from "./sections/CertificatesSection";
import { SectionCard } from "./SectionCard";
import { SortableSection } from "./SortableSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useCvStore } from "@/store/cvStore";
import { cvApi } from "@/api/cvApi";
import type { CvResponse } from "@/types/cv.types";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

function renderSection(key: string, cv: CvResponse) {
  switch (key) {
    case "experience": return <ExperienceSection cv={cv} />;
    case "projects":   return <ProjectsSection cv={cv} />;
    case "education":  return <EducationSection cv={cv} />;
    case "skills":     return <SkillsSection cv={cv} />;
    case "languages":  return <LanguagesSection cv={cv} />;
    case "certificates": return <CertificatesSection cv={cv} />;
    default: return null;
  }
}

interface Props {
  cv: CvResponse;
}

export function CvEditor({ cv }: Props) {
  const { previewTimestamp, sectionOrder, setSectionOrder } = useCvStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  useEffect(() => {
    if (!previewTimestamp) return;
    setPreviewLoading(true);
    cvApi
      .getPreview(cv.id)
      .then(({ data }) => setPreviewHtml(data))
      .catch(() => {})
      .finally(() => setPreviewLoading(false));
  }, [previewTimestamp, cv.id]);

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = sectionOrder.indexOf(active.id as string);
    const newIdx = sectionOrder.indexOf(over.id as string);
    const newOrder = arrayMove(sectionOrder, oldIdx, newIdx);
    setSectionOrder(newOrder);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      cvApi.patch(cv.id, { sectionOrder: newOrder.join(",") }).catch(() => {});
    }, 500);
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — editor forms */}
      <div className="w-2/5 overflow-y-auto border-r border-border p-4 pl-8 space-y-3">
        <AppearanceSectionCard cv={cv} />
        <SectionCard title="Personal Info">
          <PersonalInfoSection cv={cv} />
        </SectionCard>
        <SummarySection cv={cv} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sectionOrder.map((key) => (
                <SortableSection key={key} id={key}>
                  {renderSection(key, cv)}
                </SortableSection>
              ))}
            </div>
          </SortableContext>
        </DndContext>

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
