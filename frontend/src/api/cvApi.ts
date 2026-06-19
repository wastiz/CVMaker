import api from "@/lib/axios";
import type { CvListItem, CvProfile } from "@/types/cv.types";

export const cvApi = {
  list: () =>
    api.get<CvListItem[]>("/api/cv"),

  get: (id: number) =>
    api.get<CvProfile>(`/api/cv/${id}`),

  create: (data: Partial<CvProfile>) =>
    api.post<CvProfile>("/api/cv", data),

  update: (id: number, data: Partial<CvProfile>) =>
    api.put<CvProfile>(`/api/cv/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/cv/${id}`),

  duplicate: (id: number) =>
    api.post<CvProfile>(`/api/cv/${id}/duplicate`),

  getPdf: (id: number) =>
    api.get(`/api/pdf/${id}`, { responseType: "blob" }),

  getPreview: (id: number) =>
    api.get<string>(`/api/pdf/${id}/preview`),
};
