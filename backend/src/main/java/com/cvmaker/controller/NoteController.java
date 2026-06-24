package com.cvmaker.controller;

import com.cvmaker.dto.request.NoteCreateRequest;
import com.cvmaker.dto.request.NoteUpdateRequest;
import com.cvmaker.dto.response.NoteResponse;
import com.cvmaker.entity.User;
import com.cvmaker.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(noteService.getAll(user.getId()));
    }

    @PostMapping
    public ResponseEntity<NoteResponse> create(@AuthenticationPrincipal User user,
                                                @Valid @RequestBody NoteCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noteService.create(user.getId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> update(@AuthenticationPrincipal User user,
                                                @PathVariable Long id,
                                                @Valid @RequestBody NoteUpdateRequest req) {
        return ResponseEntity.ok(noteService.update(user.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        noteService.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
