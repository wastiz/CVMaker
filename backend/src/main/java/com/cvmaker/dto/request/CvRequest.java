package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CvRequest(
        @NotBlank String title,
        String templateId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String location,
        String github,
        String linkedin,
        String portfolio,
        String otherLink,
        String summary,
        String driverLicense,
        List<SkillRequest> skills,
        List<LanguageRequest> languages,
        List<ExperienceRequest> experiences,
        List<ProjectRequest> projects,
        List<EducationRequest> educations,
        List<CertificateRequest> certificates
) {
    public record SkillRequest(Long id, String type, String name, int sortOrder) {}
    public record LanguageRequest(Long id, String language, String level, int sortOrder) {}
    public record ExperienceRequest(Long id, String company, String position, String location,
                                     String startDate, String endDate, boolean isCurrent,
                                     String description, List<String> stack, int sortOrder) {}
    public record ProjectRequest(Long id, String name, String url, String description,
                                  List<String> bulletPoints, List<String> stack, int sortOrder) {}
    public record EducationRequest(Long id, String institution, String degree, String fieldOfStudy,
                                    String startDate, String endDate, boolean isCurrent,
                                    String description, int sortOrder) {}
    public record CertificateRequest(Long id, String name, String issuer, String issueDate,
                                      String url, int sortOrder) {}
}
