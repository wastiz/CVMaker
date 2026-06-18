package com.cvmaker.dto.response;

import java.time.LocalDateTime;

public record CvListResponse(
        Long id,
        String title,
        String templateId,
        String firstName,
        String lastName,
        LocalDateTime updatedAt
) {}
