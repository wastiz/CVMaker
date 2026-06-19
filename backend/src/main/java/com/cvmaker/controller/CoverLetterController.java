package com.cvmaker.controller;

import com.cvmaker.dto.request.CoverLetterCreateRequest;
import com.cvmaker.dto.request.CoverLetterUpdateRequest;
import com.cvmaker.dto.response.CoverLetterResponse;
import com.cvmaker.entity.User;
import com.cvmaker.service.CoverLetterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cover-letters")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    @GetMapping
    public ResponseEntity<List<CoverLetterResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(coverLetterService.getAll(user.getId()));
    }

    @PostMapping
    public ResponseEntity<CoverLetterResponse> create(@AuthenticationPrincipal User user,
                                                       @Valid @RequestBody CoverLetterCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(coverLetterService.create(user.getId(), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> get(@AuthenticationPrincipal User user,
                                                    @PathVariable Long id) {
        return ResponseEntity.ok(coverLetterService.getById(user.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> update(@AuthenticationPrincipal User user,
                                                       @PathVariable Long id,
                                                       @RequestBody CoverLetterUpdateRequest req) {
        return ResponseEntity.ok(coverLetterService.update(user.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        coverLetterService.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> exportPdf(@AuthenticationPrincipal User user, @PathVariable Long id) {
        byte[] pdf = coverLetterService.exportPdf(user.getId(), id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cover-letter.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{id}/txt")
    public ResponseEntity<byte[]> exportTxt(@AuthenticationPrincipal User user, @PathVariable Long id) {
        byte[] txt = coverLetterService.exportTxt(user.getId(), id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cover-letter.txt\"")
                .contentType(new MediaType("text", "plain", java.nio.charset.StandardCharsets.UTF_8))
                .body(txt);
    }
}
