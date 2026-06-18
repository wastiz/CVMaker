package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TrackerPatchRequest(
        @NotBlank String field,
        int delta
) {}
