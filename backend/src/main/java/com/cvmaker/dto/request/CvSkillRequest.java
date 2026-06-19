package com.cvmaker.dto.request;

import com.cvmaker.entity.SkillType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CvSkillRequest(
        @NotNull SkillType type,
        @NotBlank String name,
        int sortOrder
) {}
