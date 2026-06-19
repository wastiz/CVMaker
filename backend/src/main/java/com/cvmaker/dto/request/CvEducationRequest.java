package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CvEducationRequest(
        @NotBlank String institution,
        String degree,
        String fieldOfStudy,
        @NotBlank String startDate,
        String endDate,
        boolean isCurrent,
        String description,
        int sortOrder
) {}
