package com.cvmaker.dto.response;

import java.time.LocalDateTime;

public record JobTrackerResponse(
        int applied,
        int rejections,
        int interviews,
        int offers,
        LocalDateTime updatedAt
) {}
