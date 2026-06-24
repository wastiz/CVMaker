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
import java.util.Arrays;
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

        // Feature 3: split skills by showType
        Map<String, List<String>> skillsByType = cvData.skills().stream()
                .filter(CvResponse.SkillResponse::showType)
                .collect(Collectors.groupingBy(
                        s -> humanizeSkillType(s.type()),
                        LinkedHashMap::new,
                        Collectors.mapping(CvResponse.SkillResponse::name, Collectors.toList())
                ));
        List<String> skillsFlat = cvData.skills().stream()
                .filter(s -> !s.showType())
                .map(CvResponse.SkillResponse::name)
                .toList();

        // Feature 1: section order
        List<String> sectionOrder = (cvData.sectionOrder() != null && !cvData.sectionOrder().isBlank())
                ? Arrays.stream(cvData.sectionOrder().split(","))
                        .map(String::trim).filter(s -> !s.isBlank()).toList()
                : List.of("experience", "projects", "education", "skills", "languages", "certificates");

        // Feature 2: labels
        String lang = cvData.templateLanguage() != null ? cvData.templateLanguage() : "en";
        Map<String, String> labels = getLabels(lang);

        Context ctx = new Context();
        ctx.setVariable("cv", cvData);
        ctx.setVariable("skillsByType", skillsByType);
        ctx.setVariable("skillsFlat", skillsFlat);
        ctx.setVariable("sectionOrder", sectionOrder);
        ctx.setVariable("labels", labels);

        String template = "cv-templates/" + cv.getTemplateId();
        return templateEngine.process(template, ctx);
    }

    private String humanizeSkillType(String type) {
        return switch (type) {
            case "SOFT" -> "Soft skills";
            case "HARD" -> "Hard skills";
            case "LANGUAGES" -> "Languages";
            case "FRAMEWORKS" -> "Frameworks";
            case "FRONTEND" -> "Frontend";
            case "BACKEND" -> "Backend";
            case "DATABASES" -> "Databases";
            case "DEVOPS" -> "DevOps";
            case "CLOUD" -> "Cloud";
            case "TOOLS" -> "Tools";
            case "TESTING" -> "Testing";
            case "ARCHITECTURE" -> "Architecture";
            case "METHODOLOGY" -> "Methodology";
            case "MAIN" -> "Main";
            default -> type;
        };
    }

    private Map<String, String> getLabels(String lang) {
        return switch (lang) {
            case "et" -> Map.of(
                "summary", "Kokkuvõte",
                "experience", "Töökogemus",
                "projects", "Projektid",
                "education", "Haridus",
                "skills", "Oskused",
                "languages", "Keeled",
                "certificates", "Sertifikaadid"
            );
            case "ru" -> Map.of(
                "summary", "О себе",
                "experience", "Опыт работы",
                "projects", "Проекты",
                "education", "Образование",
                "skills", "Навыки",
                "languages", "Языки",
                "certificates", "Сертификаты"
            );
            default -> Map.of(
                "summary", "Summary",
                "experience", "Experience",
                "projects", "Projects",
                "education", "Education",
                "skills", "Skills",
                "languages", "Languages",
                "certificates", "Certificates"
            );
        };
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
