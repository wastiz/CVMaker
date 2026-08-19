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

function isCvJson(data: unknown): data is CvResponse {
  if (!data || typeof data !== "object") return false;
  const cv = data as Record<string, unknown>;
  return typeof cv.title === "string" && typeof cv.templateId === "string";
}

export async function importCvFromFile(file: File): Promise<CvResponse> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new CvImportError("File is not valid JSON");
  }
  if (!isCvJson(parsed)) {
    throw new CvImportError("File doesn't look like an exported resume");
  }
  const cv = parsed;

  const { data: created } = await cvApi.create({
    title: cv.title,
    templateId: cv.templateId,
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
    ...(cv.skills ?? []).map((s) =>
      cvApi.createSkill(cvId, { type: s.type, name: s.name, sortOrder: s.sortOrder, showType: s.showType })
    ),
    ...(cv.languages ?? []).map((l) =>
      cvApi.createLanguage(cvId, { language: l.language, level: l.level, sortOrder: l.sortOrder })
    ),
    ...(cv.experience ?? []).map((e) =>
      cvApi.createExperience(cvId, {
        company: e.company,
        position: e.position,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.isCurrent,
        description: e.description,
        stack: e.stack,
        sortOrder: e.sortOrder,
      })
    ),
    ...(cv.projects ?? []).map((p) =>
      cvApi.createProject(cvId, {
        name: p.name,
        url: p.url,
        description: p.description,
        bulletPoints: p.bulletPoints,
        stack: p.stack,
        sortOrder: p.sortOrder,
      })
    ),
    ...(cv.education ?? []).map((ed) =>
      cvApi.createEducation(cvId, {
        institution: ed.institution,
        degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy,
        startDate: ed.startDate,
        endDate: ed.endDate,
        isCurrent: ed.isCurrent,
        description: ed.description,
        sortOrder: ed.sortOrder,
      })
    ),
    ...(cv.certificates ?? []).map((c) =>
      cvApi.createCertificate(cvId, {
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate,
        url: c.url,
        sortOrder: c.sortOrder,
      })
    ),
  ]);

  const { data: full } = await cvApi.getById(cvId);
  return full;
}
