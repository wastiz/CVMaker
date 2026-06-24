package com.cvmaker.dto.response;

import java.time.LocalDateTime;

public record CoverLetterResponse(
        Long id,
        String title,
        String content,
        Integer fontSize,
        String fontFamily,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
