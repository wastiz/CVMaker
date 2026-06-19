export interface CvListItem {
  id: number;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CvSkill {
  id?: number;
  type: "SOFT" | "MAIN" | "HARD" | "OTHER";
  name: string;
  sortOrder: number;
}

export interface CvLanguage {
  id?: number;
  language: string;
  level: string;
  sortOrder: number;
}

export interface CvExperience {
  id?: number;
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

export interface CvProject {
  id?: number;
  name: string;
  url?: string;
  description?: string;
  bulletPoints?: string[];
  stack?: string[];
  sortOrder: number;
}

export interface CvEducation {
  id?: number;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  sortOrder: number;
}

export interface CvCertificate {
  id?: number;
  name: string;
  issuer?: string;
  issueDate?: string;
  url?: string;
  sortOrder: number;
}

export interface CvProfile {
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
  skills: CvSkill[];
  languages: CvLanguage[];
  experiences: CvExperience[];
  projects: CvProject[];
  educations: CvEducation[];
  certificates: CvCertificate[];
  createdAt: string;
  updatedAt: string;
}
