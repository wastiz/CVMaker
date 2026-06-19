package com.cvmaker.dto.request;

import com.cvmaker.entity.NoteType;
import jakarta.validation.constraints.NotNull;

public record NoteCreateRequest(
        @NotNull NoteType type,
        String title,
        String content,
        String url,
        String companyName
) {}
