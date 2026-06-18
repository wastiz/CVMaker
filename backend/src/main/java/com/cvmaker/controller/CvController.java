package com.cvmaker.controller;

import com.cvmaker.dto.request.CvRequest;
import com.cvmaker.dto.response.CvListResponse;
import com.cvmaker.dto.response.CvResponse;
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
    public ResponseEntity<List<CvListResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cvService.listCvs(user));
    }

    @PostMapping
    public ResponseEntity<CvResponse> create(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody CvRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cvService.createCv(user, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CvResponse> get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(cvService.getCv(user, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CvResponse> update(@AuthenticationPrincipal User user,
                                              @PathVariable Long id,
                                              @Valid @RequestBody CvRequest req) {
        return ResponseEntity.ok(cvService.updateCv(user, id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        cvService.deleteCv(user, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<CvResponse> duplicate(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cvService.duplicateCv(user, id));
    }
}
