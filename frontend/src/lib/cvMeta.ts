import type { CvSummaryResponse } from "@/types/cv.types";

export const TEMPLATES = [
  { id: "classic", name: "Classic", description: "Traditional single-column layout" },
  { id: "minimal", name: "Minimal", description: "Clean design with generous whitespace" },
  { id: "sidebar", name: "Sidebar", description: "Two-column layout with sidebar" },
] as const;

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ru: "Russian",
  de: "German",
  fr: "French",
  es: "Spanish",
};

export function templateLabel(id: string): string {
  return TEMPLATES.find((t) => t.id === id)?.name ?? id;
}

/** Falls back to the raw code upper-cased, for languages not in the map. */
export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

/** The text a resume is searchable by, lower-cased for case-insensitive matching. */
function searchHaystack(cv: CvSummaryResponse): string {
  return [
    cv.title,
    cv.firstName,
    cv.lastName,
    cv.summary,
    templateLabel(cv.templateId),
    cv.templateLanguage && languageLabel(cv.templateLanguage),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Filters resumes by a free-text query. Every whitespace-separated term must
 * appear somewhere in the resume, so "jane senior" narrows rather than widens.
 */
export function filterCvs(cvs: CvSummaryResponse[], query: string): CvSummaryResponse[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return cvs;
  return cvs.filter((cv) => {
    const haystack = searchHaystack(cv);
    return terms.every((term) => haystack.includes(term));
  });
}
