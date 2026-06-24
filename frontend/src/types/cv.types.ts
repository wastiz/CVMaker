export interface CvSummaryResponse {
  id: number;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export type SkillTypeKey =
  | "SOFT" | "MAIN" | "HARD" | "OTHER"
  | "LANGUAGES" | "FRAMEWORKS" | "FRONTEND" | "BACKEND"
  | "DATABASES" | "DEVOPS" | "CLOUD" | "TOOLS"
  | "TESTING" | "ARCHITECTURE" | "METHODOLOGY";

export interface CvSkillResponse {
  id: number;
  type: SkillTypeKey;
  name: string;
  sortOrder: number;
  showType: boolean;
}

export interface CvLanguageResponse {
  id: number;
  language: string;
  level: string;
  sortOrder: number;
}

export interface CvExperienceResponse {
  id: number;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  stack?: string[];
  sortOrder: number;
}

export interface CvProjectResponse {
  id: number;
  name: string;
  url?: string;
  description?: string;
  bulletPoints?: string[];
  stack?: string[];
  sortOrder: number;
}

export interface CvEducationResponse {
  id: number;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  sortOrder: number;
}

export interface CvCertificateResponse {
  id: number;
  name: string;
  issuer?: string;
  issueDate?: string;
  url?: string;
  sortOrder: number;
}

export interface CvResponse {
  id: number;
  title: string;
  templateId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  otherLink?: string;
  summary?: string;
  driverLicense?: string;
  sectionOrder?: string;
  templateLanguage?: string;
  skills: CvSkillResponse[];
  languages: CvLanguageResponse[];
  experience: CvExperienceResponse[];
  projects: CvProjectResponse[];
  education: CvEducationResponse[];
  certificates: CvCertificateResponse[];
  createdAt: string;
  updatedAt: string;
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface CvCreateRequest {
  title: string;
  templateId: string;
}

export interface CvUpdateRequest {
  title?: string;
  templateId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  otherLink?: string;
  summary?: string;
  driverLicense?: string;
  sectionOrder?: string;
  templateLanguage?: string;
}

export interface CvSkillRequest {
  type: SkillTypeKey;
  name: string;
  sortOrder: number;
  showType: boolean;
}

export interface CvLanguageRequest {
  language: string;
  level: string;
  sortOrder: number;
}

export interface CvExperienceRequest {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  stack?: string[];
  sortOrder?: number;
}

export interface CvProjectRequest {
  name: string;
  url?: string;
  description?: string;
  bulletPoints?: string[];
  stack?: string[];
  sortOrder: number;
}

export interface CvEducationRequest {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  sortOrder: number;
}

export interface CvCertificateRequest {
  name: string;
  issuer?: string;
  issueDate?: string;
  url?: string;
  sortOrder: number;
}
