"use client";

import { create } from "zustand";

interface CvState {
  currentCvId: number | null;
  setCurrentCvId: (id: number | null) => void;
}

export const useCvStore = create<CvState>((set) => ({
  currentCvId: null,
  setCurrentCvId: (id) => set({ currentCvId: id }),
}));
