package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CvStrengthRequest(
        @NotBlank String name,
        int sortOrder
) {}
