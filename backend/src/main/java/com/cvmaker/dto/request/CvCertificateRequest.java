package com.cvmaker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CvCertificateRequest(
        @NotBlank String name,
        String issuer,
        String issueDate,
        String url,
        int sortOrder
) {}
