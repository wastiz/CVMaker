package com.cvmaker.service;

import com.cvmaker.dto.request.NoteRequest;
import com.cvmaker.dto.response.NoteResponse;
import com.cvmaker.entity.Note;
import com.cvmaker.entity.User;
import com.cvmaker.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;

    public List<NoteResponse> listNotes(User user) {
        return noteRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NoteResponse createNote(User user, NoteRequest req) {
        Note note = Note.builder()
                .user(user)
                .type(req.type())
                .title(req.title())
                .content(req.content())
                .url(req.url())
                .companyName(req.companyName())
                .build();
        noteRepository.save(note);
        return toResponse(note);
    }

    @Transactional
    public NoteResponse updateNote(User user, Long id, NoteRequest req) {
        Note note = findOwned(user, id);
        note.setType(req.type());
        note.setTitle(req.title());
        note.setContent(req.content());
        note.setUrl(req.url());
        note.setCompanyName(req.companyName());
        noteRepository.save(note);
        return toResponse(note);
    }

    @Transactional
    public void deleteNote(User user, Long id) {
        Note note = findOwned(user, id);
        noteRepository.delete(note);
    }

    private Note findOwned(User user, Long id) {
        return noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Note not found: " + id));
    }

    private NoteResponse toResponse(Note n) {
        return new NoteResponse(n.getId(), n.getType(), n.getTitle(), n.getContent(),
                n.getUrl(), n.getCompanyName(), n.getCreatedAt(), n.getUpdatedAt());
    }
}
