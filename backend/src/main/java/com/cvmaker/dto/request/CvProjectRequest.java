package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CvProjectRequest(
        @NotBlank String name,
        String url,
        String description,
        List<String> bulletPoints,
        List<String> stack,
        int sortOrder
) {}
