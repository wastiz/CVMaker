package com.cvmaker.controller;

import com.cvmaker.dto.request.TrackerPatchRequest;
import com.cvmaker.dto.response.TrackerResponse;
import com.cvmaker.entity.User;
import com.cvmaker.service.JobTrackerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracker")
@RequiredArgsConstructor
public class JobTrackerController {

    private final JobTrackerService jobTrackerService;

    @GetMapping
    public ResponseEntity<TrackerResponse> get(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobTrackerService.getTracker(user));
    }

    @PatchMapping
    public ResponseEntity<TrackerResponse> patch(@AuthenticationPrincipal User user,
                                                  @Valid @RequestBody TrackerPatchRequest req) {
        return ResponseEntity.ok(jobTrackerService.patch(user, req));
    }
}
