export interface JobTrackerStats {
  applied: number;
  rejections: number;
  interviews: number;
  offers: number;
  updatedAt: string;
}

export type StatKey = "applied" | "rejections" | "interviews" | "offers";
export type TrackerField = "APPLIED" | "REJECTIONS" | "INTERVIEWS" | "OFFERS";
export type TrackerAction = "INCREMENT" | "DECREMENT";

export interface TrackerPatchRequest {
  field: TrackerField;
  action: TrackerAction;
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

export interface NoteUpdateRequest {
  title?: string;
  content?: string;
  url?: string;
  companyName?: string;
}
