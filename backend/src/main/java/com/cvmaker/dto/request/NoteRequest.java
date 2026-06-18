package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record NoteRequest(
        @NotBlank String type,
        String title,
        String content,
        String url,
        String companyName
) {}
