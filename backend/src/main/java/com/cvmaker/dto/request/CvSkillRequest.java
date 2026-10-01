package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CvSkillRequest(
        @NotBlank @Size(max = 50) String type,
        @NotBlank String name,
        int sortOrder,
        boolean showType
) {}
