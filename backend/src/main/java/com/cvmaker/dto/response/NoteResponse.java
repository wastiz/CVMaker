package com.cvmaker.dto.response;

import java.time.LocalDateTime;

public record NoteResponse(
        Long id,
        String type,
        String title,
        String content,
        String url,
        String companyName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
