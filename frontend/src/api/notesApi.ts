import api from "@/lib/axios";
import type { Note, NoteCreateRequest } from "@/types/tracker.types";

export const notesApi = {
  list: () =>
    api.get<Note[]>("/api/notes"),

  create: (data: NoteCreateRequest) =>
    api.post<Note>("/api/notes", data),

  update: (id: number, data: Partial<NoteCreateRequest>) =>
    api.put<Note>(`/api/notes/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/notes/${id}`),
};
