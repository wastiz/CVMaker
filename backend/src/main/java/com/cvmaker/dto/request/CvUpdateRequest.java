package com.cvmaker.dto.request;

import jakarta.validation.constraints.Pattern;

public record CvUpdateRequest(
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
        String sectionOrder,
        @Pattern(regexp = "en|et|ru") String templateLanguage
) {}
