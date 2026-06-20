package com.cvmaker.service;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvProfile;
import com.cvmaker.entity.User;
import com.cvmaker.exception.CvNotFoundException;
import com.cvmaker.mapper.CvMapper;
import com.cvmaker.repository.CvRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final CvRepository cvRepository;
    private final CvMapper cvMapper;
    private final TemplateEngine templateEngine;

    @Transactional(readOnly = true)
    public byte[] generatePdf(User user, Long cvId) {
        String html = renderHtml(user.getId(), cvId);
        return convertToPdf(html);
    }

    @Transactional(readOnly = true)
    public String renderHtmlPreview(User user, Long cvId) {
        return renderHtml(user.getId(), cvId);
    }

    private String renderHtml(Long userId, Long cvId) {
        CvProfile cv = cvRepository.findByIdAndUserIdAndDeletedFalse(cvId, userId)
                .orElseThrow(() -> new CvNotFoundException(cvId));

        CvResponse cvData = cvMapper.toResponse(cv);

        Map<String, List<String>> skillsByType = cvData.skills().stream()
                .collect(Collectors.groupingBy(
                        CvResponse.SkillResponse::type,
                        LinkedHashMap::new,
                        Collectors.mapping(CvResponse.SkillResponse::name, Collectors.toList())
                ));

        Context ctx = new Context();
        ctx.setVariable("cv", cvData);
        ctx.setVariable("skillsByType", skillsByType);

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
