package com.cvmaker.controller;

import com.cvmaker.dto.request.JobTrackerUpdateRequest;
import com.cvmaker.dto.response.JobTrackerResponse;
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
    public ResponseEntity<JobTrackerResponse> get(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobTrackerService.getByUserId(user.getId()));
    }

    @PatchMapping
    public ResponseEntity<JobTrackerResponse> patch(@AuthenticationPrincipal User user,
                                                     @Valid @RequestBody JobTrackerUpdateRequest req) {
        JobTrackerResponse response = switch (req.action()) {
            case INCREMENT -> jobTrackerService.increment(user.getId(), req.field());
            case DECREMENT -> jobTrackerService.decrement(user.getId(), req.field());
        };
        return ResponseEntity.ok(response);
    }
}
