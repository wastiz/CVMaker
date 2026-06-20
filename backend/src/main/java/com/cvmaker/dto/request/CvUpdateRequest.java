package com.cvmaker.dto.request;

public record CvUpdateRequest(
        String title,
        String templateId,
        String firstName,
        String lastName,
        String email,
        String phone,
        String location,
        String github,
        String linkedin,
        String portfolio,
        String otherLink,
        String summary,
        String driverLicense
) {}
