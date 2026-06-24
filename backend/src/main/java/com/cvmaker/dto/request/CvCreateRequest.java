package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CvCreateRequest(
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
        String driverLicense
) {}
