package com.cvmaker.controller;

import com.cvmaker.dto.request.CvCreateRequest;
import com.cvmaker.dto.request.CvUpdateRequest;
import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.dto.response.CvSummaryResponse;
import com.cvmaker.entity.User;
import com.cvmaker.service.CvService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;

    @GetMapping
    public ResponseEntity<List<CvSummaryResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cvService.getAll(user.getId()));
    }

    @PostMapping
    public ResponseEntity<CvResponse> create(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody CvCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cvService.create(user.getId(), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CvResponse> get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(cvService.getById(user.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CvResponse> update(@AuthenticationPrincipal User user,
                                              @PathVariable Long id,
                                              @Valid @RequestBody CvUpdateRequest req) {
        return ResponseEntity.ok(cvService.update(user.getId(), id, req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CvResponse> patch(@AuthenticationPrincipal User user,
                                             @PathVariable Long id,
                                             @RequestBody CvUpdateRequest req) {
        return ResponseEntity.ok(cvService.update(user.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        cvService.softDelete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<CvResponse> duplicate(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cvService.duplicate(user.getId(), id));
    }
}
