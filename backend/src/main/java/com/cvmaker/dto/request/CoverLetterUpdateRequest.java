package com.cvmaker.dto.request;

public record CoverLetterUpdateRequest(
        String title,
        String content,
        Integer fontSize,
        String fontFamily
) {}
