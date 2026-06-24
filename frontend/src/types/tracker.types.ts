export interface JobTrackerStats {
  id: number;
  applied: number;
  rejections: number;
  interviews: number;
  offers: number;
  updatedAt: string;
}

export type TrackerField = "applied" | "rejections" | "interviews" | "offers";
export type TrackerDelta = 1 | -1;

export interface TrackerPatchRequest {
  field: TrackerField;
  delta: TrackerDelta;
}

export type NoteType = "JOB_LINK" | "FREE";

export interface Note {
  id: number;
  type: NoteType;
  title?: string;
  content?: string;
  url?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCreateRequest {
  type: NoteType;
  title?: string;
  content?: string;
  url?: string;
  companyName?: string;
}
