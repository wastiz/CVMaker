package com.cvmaker.dto.request;

import com.cvmaker.entity.TrackerAction;
import com.cvmaker.entity.TrackerField;
import jakarta.validation.constraints.NotNull;

public record JobTrackerUpdateRequest(
        @NotNull TrackerField field,
        @NotNull TrackerAction action
) {}
