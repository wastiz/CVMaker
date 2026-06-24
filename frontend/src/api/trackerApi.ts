import api from "@/lib/axios";
import type { JobTrackerStats, TrackerPatchRequest } from "@/types/tracker.types";

export const trackerApi = {
  get: () =>
    api.get<JobTrackerStats>("/api/tracker"),

  patch: (data: TrackerPatchRequest) =>
    api.patch<JobTrackerStats>("/api/tracker", data),
};
