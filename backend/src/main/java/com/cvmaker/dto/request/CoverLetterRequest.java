package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CoverLetterRequest(
        @NotBlank String title,
        @NotBlank String content
) {}
