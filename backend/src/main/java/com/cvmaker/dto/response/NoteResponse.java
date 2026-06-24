package com.cvmaker.dto.response;

import com.cvmaker.entity.NoteType;

import java.time.LocalDateTime;

public record NoteResponse(
        Long id,
        NoteType type,
        String title,
        String content,
        String url,
        String companyName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
