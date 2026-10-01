import { cvApi } from "@/api/cvApi";
import type { CvResponse, CvUpdateRequest } from "@/types/cv.types";

export function downloadCvJson(cv: CvResponse) {
  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cv.title || "resume"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export class CvImportError extends Error {}

/**
 * Shape accepted by an import. Looser than `CvResponse` because the JSON may be
 * hand-written from the template rather than produced by an export: `id`,
 * timestamps and every `sortOrder` are optional, and item order carries the
 * ordering when `sortOrder` is absent.
 */
type ImportableCv = Omit<Partial<CvResponse>, "skills" | "strengths" | "languages" | "experience" | "projects" | "education" | "certificates"> & {
  title: string;
  skills?: Array<Partial<CvResponse["skills"][number]> & { name: string }>;
  strengths?: Array<Partial<CvResponse["strengths"][number]> & { name: string }>;
  languages?: Array<Partial<CvResponse["languages"][number]> & { language: string }>;
  experience?: Array<Partial<CvResponse["experience"][number]>>;
  projects?: Array<Partial<CvResponse["projects"][number]>>;
  education?: Array<Partial<CvResponse["education"][number]>>;
  certificates?: Array<Partial<CvResponse["certificates"][number]>>;
};

function isCvJson(data: unknown): data is ImportableCv {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const cv = data as Record<string, unknown>;
  return typeof cv.title === "string" && cv.title.trim() !== "";
}

/** Falls back to the item's position so hand-written JSON needn't number itself. */
function order(sortOrder: number | undefined, index: number): number {
  return typeof sortOrder === "number" ? sortOrder : index;
}

/** Fields the backend rejects as blank, so a typo is caught before anything is created. */
const REQUIRED_ITEM_FIELDS: Record<string, string[]> = {
  skills: ["name"],
  strengths: ["name"],
  languages: ["language"],
  experience: ["company", "position", "startDate"],
  projects: ["name"],
  education: ["institution", "startDate"],
  certificates: ["name"],
};

/**
 * Hand-written JSON fails in ways an export never did, and the sections are
 * created in parallel — so a bad item would leave a half-filled resume behind.
 * Checking up front means an invalid file creates nothing at all.
 */
function assertImportable(cv: ImportableCv) {
  const problems: string[] = [];

  for (const [section, fields] of Object.entries(REQUIRED_ITEM_FIELDS)) {
    const items = (cv as Record<string, unknown>)[section];
    if (items === undefined || items === null) continue;
    if (!Array.isArray(items)) {
      problems.push(`"${section}" must be a list`);
      continue;
    }
    items.forEach((item, i) => {
      if (!item || typeof item !== "object") {
        problems.push(`${section}[${i}] must be an object`);
        return;
      }
      for (const field of fields) {
        const value = (item as Record<string, unknown>)[field];
        if (typeof value !== "string" || value.trim() === "") {
          problems.push(`${section}[${i}] needs a "${field}"`);
        }
      }
    });
  }

  if (problems.length > 0) {
    const shown = problems.slice(0, 3).join("; ");
    const rest = problems.length > 3 ? ` (+${problems.length - 3} more)` : "";
    throw new CvImportError(shown + rest);
  }
}

export function parseCvJson(text: string): ImportableCv {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new CvImportError("That is not valid JSON");
  }
  if (!isCvJson(parsed)) {
    throw new CvImportError('Missing a "title" — that field is required');
  }
  return parsed;
}

export async function importCvFromFile(file: File): Promise<CvResponse> {
  return importCvFromJson(await file.text());
}

export async function importCvFromJson(text: string): Promise<CvResponse> {
  const cv = parseCvJson(text);
  assertImportable(cv);

  const { data: created } = await cvApi.create({
    title: cv.title.trim(),
    templateId: cv.templateId ?? "classic",
    firstName: cv.firstName,
    lastName: cv.lastName,
    email: cv.email,
    phone: cv.phone,
    location: cv.location,
    github: cv.github,
    linkedin: cv.linkedin,
    portfolio: cv.portfolio,
    otherLink: cv.otherLink,
    summary: cv.summary,
    driverLicense: cv.driverLicense,
    workPermit: cv.workPermit,
  });
  const cvId = created.id;

  const followUp: CvUpdateRequest = {
    sectionOrder: cv.sectionOrder,
    templateLanguage: cv.templateLanguage,
    fontFamily: cv.fontFamily,
    fontSizePt: cv.fontSizePt,
  };
  if (Object.values(followUp).some((v) => v !== undefined)) {
    await cvApi.update(cvId, followUp);
  }

  await Promise.all([
    ...(cv.skills ?? []).map((s, i) =>
      cvApi.createSkill(cvId, {
        type: s.type ?? "HARD",
        name: s.name,
        sortOrder: order(s.sortOrder, i),
        showType: s.showType ?? true,
      })
    ),
    ...(cv.strengths ?? []).map((s, i) =>
      cvApi.createStrength(cvId, { name: s.name, sortOrder: order(s.sortOrder, i) })
    ),
    ...(cv.languages ?? []).map((l, i) =>
      cvApi.createLanguage(cvId, {
        language: l.language,
        level: l.level ?? "",
        sortOrder: order(l.sortOrder, i),
      })
    ),
    ...(cv.experience ?? []).map((e, i) =>
      cvApi.createExperience(cvId, {
        company: e.company ?? "",
        position: e.position ?? "",
        location: e.location,
        startDate: e.startDate ?? "",
        endDate: e.endDate,
        isCurrent: e.isCurrent ?? false,
        description: e.description,
        bulletPoints: e.bulletPoints,
        stack: e.stack,
        sortOrder: order(e.sortOrder, i),
      })
    ),
    ...(cv.projects ?? []).map((p, i) =>
      cvApi.createProject(cvId, {
        name: p.name ?? "",
        url: p.url,
        description: p.description,
        bulletPoints: p.bulletPoints,
        stack: p.stack,
        sortOrder: order(p.sortOrder, i),
      })
    ),
    ...(cv.education ?? []).map((ed, i) =>
      cvApi.createEducation(cvId, {
        institution: ed.institution ?? "",
        degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy,
        startDate: ed.startDate ?? "",
        endDate: ed.endDate,
        isCurrent: ed.isCurrent ?? false,
        description: ed.description,
        sortOrder: order(ed.sortOrder, i),
      })
    ),
    ...(cv.certificates ?? []).map((c, i) =>
      cvApi.createCertificate(cvId, {
        name: c.name ?? "",
        issuer: c.issuer,
        issueDate: c.issueDate,
        url: c.url,
        sortOrder: order(c.sortOrder, i),
      })
    ),
  ]);

  const { data: full } = await cvApi.getById(cvId);
  return full;
}

/**
 * Starting point for writing a resume by hand. Every section is present with a
 * filled example so the expected shape is obvious; `sortOrder`, `id` and the
 * timestamps are deliberately left out — only `title` is actually required.
 */
export const CV_JSON_TEMPLATE = `{
  "title": "My Resume",
  "templateId": "classic",
  "templateLanguage": "en",

  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+372 5555 5555",
  "location": "Tallinn, Estonia",
  "github": "https://github.com/janedoe",
  "linkedin": "https://linkedin.com/in/janedoe",
  "portfolio": "https://janedoe.dev",
  "otherLink": "",
  "driverLicense": "B",
  "workPermit": "EU citizen",
  "summary": "Backend developer with 4 years of experience building Java and Spring Boot services.",

  "skills": [
    { "type": "LANGUAGES", "name": "Java" },
    { "type": "FRAMEWORKS", "name": "Spring Boot" },
    { "type": "Game Engines", "name": "Unity" },
    { "type": "SOFT", "name": "Mentoring", "showType": false }
  ],

  "strengths": [
    { "name": "Ships features end to end" }
  ],

  "languages": [
    { "language": "English", "level": "C1" },
    { "language": "Estonian", "level": "B1" }
  ],

  "experience": [
    {
      "company": "Example OÜ",
      "position": "Backend Developer",
      "location": "Tallinn",
      "startDate": "Jan 2022",
      "endDate": null,
      "isCurrent": true,
      "description": "Owned the billing service.",
      "bulletPoints": [
        "Cut checkout latency by 40%",
        "Migrated 12 endpoints to Spring Boot 3"
      ],
      "stack": ["Java", "Spring Boot", "PostgreSQL"]
    }
  ],

  "projects": [
    {
      "name": "CV Maker",
      "url": "https://github.com/janedoe/cv-maker",
      "description": "Resume builder with PDF export.",
      "bulletPoints": ["Built the Thymeleaf to PDF pipeline"],
      "stack": ["Next.js", "Spring Boot"]
    }
  ],

  "education": [
    {
      "institution": "Tallinn University of Technology",
      "degree": "BSc",
      "fieldOfStudy": "Computer Science",
      "startDate": "Sep 2017",
      "endDate": "Jun 2020",
      "isCurrent": false,
      "description": ""
    }
  ],

  "certificates": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon Web Services",
      "issueDate": "Mar 2023",
      "url": ""
    }
  ]
}
`;
