package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CvExperienceRequest(
        @NotBlank String company,
        @NotBlank String position,
        String location,
        @NotBlank String startDate,
        String endDate,
        boolean isCurrent,
        String description,
        List<String> stack,
        int sortOrder
) {}
