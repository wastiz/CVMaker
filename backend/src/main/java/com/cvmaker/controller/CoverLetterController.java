package com.cvmaker.controller;

import com.cvmaker.dto.request.CoverLetterRequest;
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
        return ResponseEntity.ok(coverLetterService.listCoverLetters(user));
    }

    @PostMapping
    public ResponseEntity<CoverLetterResponse> create(@AuthenticationPrincipal User user,
                                                       @Valid @RequestBody CoverLetterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(coverLetterService.createCoverLetter(user, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(coverLetterService.getCoverLetter(user, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoverLetterResponse> update(@AuthenticationPrincipal User user,
                                                       @PathVariable Long id,
                                                       @Valid @RequestBody CoverLetterRequest req) {
        return ResponseEntity.ok(coverLetterService.updateCoverLetter(user, id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        coverLetterService.deleteCoverLetter(user, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/txt")
    public ResponseEntity<byte[]> exportTxt(@AuthenticationPrincipal User user, @PathVariable Long id) {
        byte[] content = coverLetterService.exportAsTxt(user, id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cover-letter.txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(content);
    }
}
