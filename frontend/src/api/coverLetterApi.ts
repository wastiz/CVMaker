import api from "@/lib/axios";

export interface CoverLetter {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetterRequest {
  title: string;
  content: string;
}

export const coverLetterApi = {
  list: () =>
    api.get<CoverLetter[]>("/api/cover-letters"),

  get: (id: number) =>
    api.get<CoverLetter>(`/api/cover-letters/${id}`),

  create: (data: CoverLetterRequest) =>
    api.post<CoverLetter>("/api/cover-letters", data),

  update: (id: number, data: CoverLetterRequest) =>
    api.put<CoverLetter>(`/api/cover-letters/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/cover-letters/${id}`),

  getPdf: (id: number) =>
    api.get(`/api/cover-letters/${id}/pdf`, { responseType: "blob" }),

  getTxt: (id: number) =>
    api.get(`/api/cover-letters/${id}/txt`, { responseType: "blob" }),
};
