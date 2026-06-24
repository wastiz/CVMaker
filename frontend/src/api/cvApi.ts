import api from "@/lib/axios";
import type {
  CvSummaryResponse,
  CvResponse,
  CvCreateRequest,
  CvUpdateRequest,
  CvSkillRequest,
  CvSkillResponse,
  CvLanguageRequest,
  CvLanguageResponse,
  CvExperienceRequest,
  CvExperienceResponse,
  CvProjectRequest,
  CvProjectResponse,
  CvEducationRequest,
  CvEducationResponse,
  CvCertificateRequest,
  CvCertificateResponse,
} from "@/types/cv.types";

export const cvApi = {
  // CV profile
  getAll: () => api.get<CvSummaryResponse[]>("/api/cv"),
  getById: (id: number) => api.get<CvResponse>(`/api/cv/${id}`),
  create: (data: CvCreateRequest) => api.post<CvResponse>("/api/cv", data),
  update: (id: number, data: CvUpdateRequest) => api.put<CvResponse>(`/api/cv/${id}`, data),
  patch: (id: number, data: Partial<CvUpdateRequest>) => api.patch<CvResponse>(`/api/cv/${id}`, data),
  duplicate: (id: number) => api.post<CvResponse>(`/api/cv/${id}/duplicate`),
  remove: (id: number) => api.delete(`/api/cv/${id}`),
  getPdf: (id: number) => api.get(`/api/pdf/${id}`, { responseType: "blob" }),
  getPreview: (id: number) => api.get<string>(`/api/pdf/${id}/preview`, { responseType: "text" }),

  // Skills
  createSkill: (cvId: number, data: CvSkillRequest) =>
    api.post<CvSkillResponse>(`/api/cv/${cvId}/skills`, data),
  updateSkill: (cvId: number, id: number, data: CvSkillRequest) =>
    api.put<CvSkillResponse>(`/api/cv/${cvId}/skills/${id}`, data),
  deleteSkill: (cvId: number, id: number) =>
    api.delete(`/api/cv/${cvId}/skills/${id}`),

  // Languages
  createLanguage: (cvId: number, data: CvLanguageRequest) =>
    api.post<CvLanguageResponse>(`/api/cv/${cvId}/languages`, data),
  updateLanguage: (cvId: number, id: number, data: CvLanguageRequest) =>
    api.put<CvLanguageResponse>(`/api/cv/${cvId}/languages/${id}`, data),
  deleteLanguage: (cvId: number, id: number) =>
    api.delete(`/api/cv/${cvId}/languages/${id}`),

  // Experience
  createExperience: (cvId: number, data: CvExperienceRequest) =>
    api.post<CvExperienceResponse>(`/api/cv/${cvId}/experience`, data),
  updateExperience: (cvId: number, id: number, data: CvExperienceRequest) =>
    api.put<CvExperienceResponse>(`/api/cv/${cvId}/experience/${id}`, data),
  deleteExperience: (cvId: number, id: number) =>
    api.delete(`/api/cv/${cvId}/experience/${id}`),

  // Projects
  createProject: (cvId: number, data: CvProjectRequest) =>
    api.post<CvProjectResponse>(`/api/cv/${cvId}/projects`, data),
  updateProject: (cvId: number, id: number, data: CvProjectRequest) =>
    api.put<CvProjectResponse>(`/api/cv/${cvId}/projects/${id}`, data),
  deleteProject: (cvId: number, id: number) =>
    api.delete(`/api/cv/${cvId}/projects/${id}`),

  // Education
  createEducation: (cvId: number, data: CvEducationRequest) =>
    api.post<CvEducationResponse>(`/api/cv/${cvId}/education`, data),
  updateEducation: (cvId: number, id: number, data: CvEducationRequest) =>
    api.put<CvEducationResponse>(`/api/cv/${cvId}/education/${id}`, data),
  deleteEducation: (cvId: number, id: number) =>
    api.delete(`/api/cv/${cvId}/education/${id}`),

  // Certificates
  createCertificate: (cvId: number, data: CvCertificateRequest) =>
    api.post<CvCertificateResponse>(`/api/cv/${cvId}/certificates`, data),
  updateCertificate: (cvId: number, id: number, data: CvCertificateRequest) =>
    api.put<CvCertificateResponse>(`/api/cv/${cvId}/certificates/${id}`, data),
  deleteCertificate: (cvId: number, id: number) =>
    api.delete(`/api/cv/${cvId}/certificates/${id}`),
};
