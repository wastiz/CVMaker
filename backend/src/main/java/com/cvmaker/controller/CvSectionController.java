package com.cvmaker.controller;

import com.cvmaker.dto.request.*;
import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.User;
import com.cvmaker.service.CvSectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CvSectionController {

    private final CvSectionService sectionService;

    // ─── Skills ──────────────────────────────────────────────────────────────

    @PostMapping("/{cvId}/skills")
    public ResponseEntity<CvResponse.SkillResponse> createSkill(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @Valid @RequestBody CvSkillRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.createSkill(user.getId(), cvId, req));
    }

    @PutMapping("/{cvId}/skills/{id}")
    public ResponseEntity<CvResponse.SkillResponse> updateSkill(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id,
            @Valid @RequestBody CvSkillRequest req) {
        return ResponseEntity.ok(sectionService.updateSkill(user.getId(), cvId, id, req));
    }

    @DeleteMapping("/{cvId}/skills/{id}")
    public ResponseEntity<Void> deleteSkill(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id) {
        sectionService.deleteSkill(user.getId(), cvId, id);
        return ResponseEntity.noContent().build();
    }

    // ─── Languages ───────────────────────────────────────────────────────────

    @PostMapping("/{cvId}/languages")
    public ResponseEntity<CvResponse.LanguageResponse> createLanguage(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @Valid @RequestBody CvLanguageRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.createLanguage(user.getId(), cvId, req));
    }

    @PutMapping("/{cvId}/languages/{id}")
    public ResponseEntity<CvResponse.LanguageResponse> updateLanguage(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id,
            @Valid @RequestBody CvLanguageRequest req) {
        return ResponseEntity.ok(sectionService.updateLanguage(user.getId(), cvId, id, req));
    }

    @DeleteMapping("/{cvId}/languages/{id}")
    public ResponseEntity<Void> deleteLanguage(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id) {
        sectionService.deleteLanguage(user.getId(), cvId, id);
        return ResponseEntity.noContent().build();
    }

    // ─── Experience ──────────────────────────────────────────────────────────

    @PostMapping("/{cvId}/experience")
    public ResponseEntity<CvResponse.ExperienceResponse> createExperience(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @Valid @RequestBody CvExperienceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.createExperience(user.getId(), cvId, req));
    }

    @PutMapping("/{cvId}/experience/{id}")
    public ResponseEntity<CvResponse.ExperienceResponse> updateExperience(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id,
            @Valid @RequestBody CvExperienceRequest req) {
        return ResponseEntity.ok(sectionService.updateExperience(user.getId(), cvId, id, req));
    }

    @DeleteMapping("/{cvId}/experience/{id}")
    public ResponseEntity<Void> deleteExperience(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id) {
        sectionService.deleteExperience(user.getId(), cvId, id);
        return ResponseEntity.noContent().build();
    }

    // ─── Projects ────────────────────────────────────────────────────────────

    @PostMapping("/{cvId}/projects")
    public ResponseEntity<CvResponse.ProjectResponse> createProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @Valid @RequestBody CvProjectRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.createProject(user.getId(), cvId, req));
    }

    @PutMapping("/{cvId}/projects/{id}")
    public ResponseEntity<CvResponse.ProjectResponse> updateProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id,
            @Valid @RequestBody CvProjectRequest req) {
        return ResponseEntity.ok(sectionService.updateProject(user.getId(), cvId, id, req));
    }

    @DeleteMapping("/{cvId}/projects/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id) {
        sectionService.deleteProject(user.getId(), cvId, id);
        return ResponseEntity.noContent().build();
    }

    // ─── Education ───────────────────────────────────────────────────────────

    @PostMapping("/{cvId}/education")
    public ResponseEntity<CvResponse.EducationResponse> createEducation(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @Valid @RequestBody CvEducationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.createEducation(user.getId(), cvId, req));
    }

    @PutMapping("/{cvId}/education/{id}")
    public ResponseEntity<CvResponse.EducationResponse> updateEducation(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id,
            @Valid @RequestBody CvEducationRequest req) {
        return ResponseEntity.ok(sectionService.updateEducation(user.getId(), cvId, id, req));
    }

    @DeleteMapping("/{cvId}/education/{id}")
    public ResponseEntity<Void> deleteEducation(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id) {
        sectionService.deleteEducation(user.getId(), cvId, id);
        return ResponseEntity.noContent().build();
    }

    // ─── Certificates ────────────────────────────────────────────────────────

    @PostMapping("/{cvId}/certificates")
    public ResponseEntity<CvResponse.CertificateResponse> createCertificate(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @Valid @RequestBody CvCertificateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sectionService.createCertificate(user.getId(), cvId, req));
    }

    @PutMapping("/{cvId}/certificates/{id}")
    public ResponseEntity<CvResponse.CertificateResponse> updateCertificate(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id,
            @Valid @RequestBody CvCertificateRequest req) {
        return ResponseEntity.ok(sectionService.updateCertificate(user.getId(), cvId, id, req));
    }

    @DeleteMapping("/{cvId}/certificates/{id}")
    public ResponseEntity<Void> deleteCertificate(
            @AuthenticationPrincipal User user,
            @PathVariable Long cvId,
            @PathVariable Long id) {
        sectionService.deleteCertificate(user.getId(), cvId, id);
        return ResponseEntity.noContent().build();
    }
}
