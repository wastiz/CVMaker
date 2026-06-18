package com.cvmaker.controller;

import com.cvmaker.entity.User;
import com.cvmaker.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
public class PdfController {

    private final PdfService pdfService;

    @GetMapping("/{cvId}")
    public ResponseEntity<byte[]> downloadPdf(@AuthenticationPrincipal User user,
                                               @PathVariable Long cvId) {
        byte[] pdf = pdfService.generatePdf(user, cvId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cv.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{cvId}/preview")
    public ResponseEntity<String> previewHtml(@AuthenticationPrincipal User user,
                                               @PathVariable Long cvId) {
        String html = pdfService.renderHtmlPreview(user, cvId);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }
}
