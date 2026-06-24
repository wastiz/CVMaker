package com.cvmaker.dto.request;

public record NoteUpdateRequest(
        String title,
        String content,
        String url,
        String companyName
) {}
