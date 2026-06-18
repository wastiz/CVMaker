package com.cvmaker.controller;

import com.cvmaker.dto.response.TemplateResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private static final List<TemplateResponse> TEMPLATES = List.of(
            new TemplateResponse("classic", "Classic", "/previews/classic.png"),
            new TemplateResponse("minimal", "Minimal", "/previews/minimal.png"),
            new TemplateResponse("sidebar", "Sidebar", "/previews/sidebar.png")
    );

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> list() {
        return ResponseEntity.ok(TEMPLATES);
    }
}
