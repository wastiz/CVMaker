package com.cvmaker.dto.response;

import java.time.LocalDateTime;

public record CvSummaryResponse(
        Long id,
        String title,
        String templateId,
        String firstName,
        String lastName,
        String summary,
        String templateLanguage,
        LocalDateTime updatedAt
) {}
