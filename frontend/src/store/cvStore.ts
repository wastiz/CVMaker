"use client";

import { create } from "zustand";
import { cvApi } from "@/api/cvApi";
import type { CvResponse } from "@/types/cv.types";

export const DEFAULT_SECTION_ORDER = [
  "experience",
  "projects",
  "education",
  "skills",
  "languages",
  "certificates",
];

function parseSectionOrder(raw?: string): string[] {
  if (!raw) return DEFAULT_SECTION_ORDER;
  const parsed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_SECTION_ORDER;
}

interface CvStore {
  cv: CvResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  previewTimestamp: number;
  sectionOrder: string[];
  setCv: (cv: CvResponse | null) => void;
  updateCvField: <K extends keyof CvResponse>(field: K, value: CvResponse[K]) => void;
  loadCv: (id: number) => Promise<void>;
  setSectionOrder: (order: string[]) => void;
}

export const useCvStore = create<CvStore>((set, get) => ({
  cv: null,
  isLoading: false,
  isSaving: false,
  previewTimestamp: 0,
  sectionOrder: DEFAULT_SECTION_ORDER,

  setCv: (cv) =>
    set({
      cv,
      previewTimestamp: Date.now(),
      sectionOrder: parseSectionOrder(cv?.sectionOrder),
    }),

  updateCvField: (field, value) => {
    const { cv } = get();
    if (!cv) return;
    set({ cv: { ...cv, [field]: value } });
  },

  loadCv: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await cvApi.getById(id);
      set({
        cv: data,
        previewTimestamp: Date.now(),
        sectionOrder: parseSectionOrder(data.sectionOrder),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setSectionOrder: (order) => {
    const { cv } = get();
    if (!cv) return;
    set({
      sectionOrder: order,
      cv: { ...cv, sectionOrder: order.join(",") },
    });
  },
}));
