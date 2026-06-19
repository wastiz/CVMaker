package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CoverLetterCreateRequest(
        @NotBlank String title,
        @NotBlank String content,
        Integer fontSize,
        String fontFamily
) {}
