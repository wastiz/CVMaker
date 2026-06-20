"use client";

import { create } from "zustand";
import { cvApi } from "@/api/cvApi";
import type { CvResponse } from "@/types/cv.types";

interface CvStore {
  cv: CvResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  previewTimestamp: number;
  setCv: (cv: CvResponse | null) => void;
  updateCvField: <K extends keyof CvResponse>(field: K, value: CvResponse[K]) => void;
  loadCv: (id: number) => Promise<void>;
}

export const useCvStore = create<CvStore>((set, get) => ({
  cv: null,
  isLoading: false,
  isSaving: false,
  previewTimestamp: 0,

  setCv: (cv) => set({ cv, previewTimestamp: Date.now() }),

  updateCvField: (field, value) => {
    const { cv } = get();
    if (!cv) return;
    set({ cv: { ...cv, [field]: value } });
  },

  loadCv: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await cvApi.getById(id);
      set({ cv: data, previewTimestamp: Date.now() });
    } finally {
      set({ isLoading: false });
    }
  },
}));
