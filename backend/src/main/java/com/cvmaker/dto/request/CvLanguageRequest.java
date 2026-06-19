package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CvLanguageRequest(
        @NotBlank String language,
        String level,
        int sortOrder
) {}
