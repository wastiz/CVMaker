package com.cvmaker.service;

import com.cvmaker.dto.request.NoteCreateRequest;
import com.cvmaker.dto.request.NoteUpdateRequest;
import com.cvmaker.dto.response.NoteResponse;
import com.cvmaker.entity.Note;
import com.cvmaker.entity.NoteType;
import com.cvmaker.entity.User;
import com.cvmaker.exception.NoteNotFoundException;
import com.cvmaker.repository.NoteRepository;
import com.cvmaker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoteResponse> getAll(Long userId) {
        return noteRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NoteResponse create(Long userId, NoteCreateRequest req) {
        validateByType(req.type(), req.url(), req.content());
        User user = userRepository.getReferenceById(userId);
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
    public NoteResponse update(Long userId, Long noteId, NoteUpdateRequest req) {
        Note note = findOwned(userId, noteId);
        validateByType(note.getType(), req.url(), req.content());
        note.setTitle(req.title());
        note.setContent(req.content());
        note.setUrl(req.url());
        note.setCompanyName(req.companyName());
        noteRepository.save(note);
        return toResponse(note);
    }

    @Transactional
    public void delete(Long userId, Long noteId) {
        Note note = findOwned(userId, noteId);
        noteRepository.delete(note);
    }

    private Note findOwned(Long userId, Long noteId) {
        return noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new NoteNotFoundException(noteId));
    }

    private void validateByType(NoteType type, String url, String content) {
        if (type == NoteType.JOB_LINK && (url == null || url.isBlank())) {
            throw new IllegalArgumentException("url is required for JOB_LINK notes");
        }
        if (type == NoteType.FREE && (content == null || content.isBlank())) {
            throw new IllegalArgumentException("content is required for FREE notes");
        }
    }

    private NoteResponse toResponse(Note n) {
        return new NoteResponse(n.getId(), n.getType(), n.getTitle(), n.getContent(),
                n.getUrl(), n.getCompanyName(), n.getCreatedAt(), n.getUpdatedAt());
    }
}
