package com.cvmaker.service;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvProfile;
import com.cvmaker.entity.User;
import com.cvmaker.exception.CvNotFoundException;
import com.cvmaker.repository.CvRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final CvRepository cvRepository;
    private final CvService cvService;
    private final TemplateEngine templateEngine;

    public byte[] generatePdf(User user, Long cvId) {
        String html = renderHtml(user, cvId);
        return convertToPdf(html);
    }

    public String renderHtmlPreview(User user, Long cvId) {
        return renderHtml(user, cvId);
    }

    private String renderHtml(User user, Long cvId) {
        CvProfile cv = cvRepository.findByIdAndUserAndDeletedFalse(cvId, user)
                .orElseThrow(() -> new CvNotFoundException(cvId));

        CvResponse cvData = cvService.toResponse(cv);
        Context ctx = new Context();
        ctx.setVariable("cv", cvData);

        String template = "cv-templates/" + cv.getTemplateId();
        return templateEngine.process(template, ctx);
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
