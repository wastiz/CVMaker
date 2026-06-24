package com.cvmaker.service;

import com.cvmaker.dto.request.CoverLetterCreateRequest;
import com.cvmaker.dto.request.CoverLetterUpdateRequest;
import com.cvmaker.dto.response.CoverLetterResponse;
import com.cvmaker.entity.CoverLetter;
import com.cvmaker.entity.User;
import com.cvmaker.exception.CoverLetterNotFoundException;
import com.cvmaker.repository.CoverLetterRepository;
import com.cvmaker.repository.UserRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;

    @Transactional(readOnly = true)
    public List<CoverLetterResponse> getAll(Long userId) {
        return coverLetterRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CoverLetterResponse getById(Long userId, Long id) {
        return toResponse(findOwned(userId, id));
    }

    @Transactional
    public CoverLetterResponse create(Long userId, CoverLetterCreateRequest req) {
        User user = userRepository.getReferenceById(userId);
        CoverLetter cl = CoverLetter.builder()
                .user(user)
                .title(req.title())
                .content(req.content())
                .fontSize(req.fontSize() != null ? req.fontSize() : 14)
                .fontFamily(req.fontFamily() != null && !req.fontFamily().isBlank() ? req.fontFamily() : "Inter")
                .build();
        coverLetterRepository.save(cl);
        return toResponse(cl);
    }

    @Transactional
    public CoverLetterResponse update(Long userId, Long id, CoverLetterUpdateRequest req) {
        CoverLetter cl = findOwned(userId, id);
        if (req.title() != null && !req.title().isBlank()) {
            cl.setTitle(req.title());
        }
        if (req.content() != null) {
            cl.setContent(req.content());
        }
        if (req.fontSize() != null) {
            cl.setFontSize(req.fontSize());
        }
        if (req.fontFamily() != null && !req.fontFamily().isBlank()) {
            cl.setFontFamily(req.fontFamily());
        }
        coverLetterRepository.save(cl);
        return toResponse(cl);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        CoverLetter cl = findOwned(userId, id);
        coverLetterRepository.delete(cl);
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf(Long userId, Long id) {
        CoverLetter cl = findOwned(userId, id);
        Context ctx = new Context();
        ctx.setVariable("content", cl.getContent());
        ctx.setVariable("fontSize", cl.getFontSize());
        ctx.setVariable("fontFamily", cl.getFontFamily());
        String html = templateEngine.process("cover-letter", ctx);
        return convertToPdf(html);
    }

    @Transactional(readOnly = true)
    public byte[] exportTxt(Long userId, Long id) {
        CoverLetter cl = findOwned(userId, id);
        return cl.getContent().getBytes(StandardCharsets.UTF_8);
    }

    private CoverLetter findOwned(Long userId, Long id) {
        return coverLetterRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CoverLetterNotFoundException(id));
    }

    private CoverLetterResponse toResponse(CoverLetter cl) {
        return new CoverLetterResponse(
                cl.getId(),
                cl.getTitle(),
                cl.getContent(),
                cl.getFontSize(),
                cl.getFontFamily(),
                cl.getCreatedAt(),
                cl.getUpdatedAt()
        );
    }

    private byte[] convertToPdf(String html) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }
}
