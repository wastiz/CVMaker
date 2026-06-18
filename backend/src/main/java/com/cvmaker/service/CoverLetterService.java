package com.cvmaker.service;

import com.cvmaker.dto.request.CoverLetterRequest;
import com.cvmaker.dto.response.CoverLetterResponse;
import com.cvmaker.entity.CoverLetter;
import com.cvmaker.entity.User;
import com.cvmaker.repository.CoverLetterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;

    public List<CoverLetterResponse> listCoverLetters(User user) {
        return coverLetterRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CoverLetterResponse createCoverLetter(User user, CoverLetterRequest req) {
        CoverLetter cl = CoverLetter.builder()
                .user(user)
                .title(req.title())
                .content(req.content())
                .build();
        coverLetterRepository.save(cl);
        return toResponse(cl);
    }

    public CoverLetterResponse getCoverLetter(User user, Long id) {
        return toResponse(findOwned(user, id));
    }

    @Transactional
    public CoverLetterResponse updateCoverLetter(User user, Long id, CoverLetterRequest req) {
        CoverLetter cl = findOwned(user, id);
        cl.setTitle(req.title());
        cl.setContent(req.content());
        coverLetterRepository.save(cl);
        return toResponse(cl);
    }

    @Transactional
    public void deleteCoverLetter(User user, Long id) {
        CoverLetter cl = findOwned(user, id);
        coverLetterRepository.delete(cl);
    }

    public byte[] exportAsTxt(User user, Long id) {
        CoverLetter cl = findOwned(user, id);
        return cl.getContent().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private CoverLetter findOwned(User user, Long id) {
        return coverLetterRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Cover letter not found: " + id));
    }

    private CoverLetterResponse toResponse(CoverLetter cl) {
        return new CoverLetterResponse(cl.getId(), cl.getTitle(), cl.getContent(),
                cl.getCreatedAt(), cl.getUpdatedAt());
    }
}
