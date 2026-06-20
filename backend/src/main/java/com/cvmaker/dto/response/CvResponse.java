package com.cvmaker.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

public record CvResponse(
        Long id,
        String title,
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
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<SkillResponse> skills,
        List<LanguageResponse> languages,
        @JsonProperty("experience") List<ExperienceResponse> experiences,
        List<ProjectResponse> projects,
        @JsonProperty("education") List<EducationResponse> educations,
        List<CertificateResponse> certificates
) {
    public record SkillResponse(Long id, String type, String name, int sortOrder) {}
    public record LanguageResponse(Long id, String language, String level, int sortOrder) {}
    public record ExperienceResponse(Long id, String company, String position, String location,
                                      String startDate, String endDate, boolean isCurrent,
                                      String description, List<String> stack, int sortOrder) {}
    public record ProjectResponse(Long id, String name, String url, String description,
                                   List<String> bulletPoints, List<String> stack, int sortOrder) {}
    public record EducationResponse(Long id, String institution, String degree, String fieldOfStudy,
                                     String startDate, String endDate, boolean isCurrent,
                                     String description, int sortOrder) {}
    public record CertificateResponse(Long id, String name, String issuer, String issueDate,
                                       String url, int sortOrder) {}
}
