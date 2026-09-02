package com.cvmaker.service;

import com.cvmaker.dto.response.CvResponse;
import com.cvmaker.entity.CvProfile;
import com.cvmaker.entity.User;
import com.cvmaker.exception.CvNotFoundException;
import com.cvmaker.mapper.CvMapper;
import com.cvmaker.repository.CvRepository;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.openhtmltopdf.svgsupport.BatikSVGDrawer; 
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
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

        String lang = cvData.templateLanguage() != null ? cvData.templateLanguage() : "en";
        Map<String, String> labels = getLabels(lang);

        // Feature 3: split skills by showType
        Map<String, List<String>> skillsByType = cvData.skills().stream()
                .filter(CvResponse.SkillResponse::showType)
                .collect(Collectors.groupingBy(
                        s -> humanizeSkillType(s.type(), lang),
                        LinkedHashMap::new,
                        Collectors.mapping(CvResponse.SkillResponse::name, Collectors.toList())
                ));
        List<String> skillsFlat = cvData.skills().stream()
                .filter(s -> !s.showType())
                .map(CvResponse.SkillResponse::name)
                .toList();

        // Feature 1: section order
        List<String> sectionOrder = resolveSectionOrder(cvData.sectionOrder());

        String fontFamily = cvData.fontFamily() != null ? cvData.fontFamily() : "inter";
        int fontSizePt = cvData.fontSizePt() > 0 ? cvData.fontSizePt() : 10;

        Context ctx = new Context();
        ctx.setVariable("cv", cvData);
        ctx.setVariable("skillsByType", skillsByType);
        ctx.setVariable("skillsFlat", skillsFlat);
        ctx.setVariable("sectionOrder", sectionOrder);
        ctx.setVariable("labels", labels);
        ctx.setVariable("fontImportUrl", getFontImportUrl(fontFamily));
        ctx.setVariable("fontCssStack", getFontCssStack(fontFamily));
        ctx.setVariable("fontSizePt", fontSizePt);

        String template = "cv-templates/" + cv.getTemplateId();
        return templateEngine.process(template, ctx);
    }

    private static final List<String> DEFAULT_SECTION_ORDER =
            List.of("experience", "projects", "education", "skills", "strengths", "languages", "certificates");

    /**
     * Stored orders predate later sections, so anything missing from the saved
     * value is appended in its default position instead of silently vanishing
     * from the rendered CV.
     */
    private List<String> resolveSectionOrder(String stored) {
        if (stored == null || stored.isBlank()) return DEFAULT_SECTION_ORDER;
        List<String> saved = Arrays.stream(stored.split(","))
                .map(String::trim).filter(s -> !s.isBlank()).toList();
        if (saved.isEmpty()) return DEFAULT_SECTION_ORDER;
        List<String> merged = new ArrayList<>(saved);
        DEFAULT_SECTION_ORDER.stream().filter(s -> !merged.contains(s)).forEach(merged::add);
        return merged;
    }

    private String getFontImportUrl(String fontFamily) {
        return switch (fontFamily) {
            case "roboto"        -> "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap";
            case "lato"          -> "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap";
            case "merriweather"  -> "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap";
            case "sourcecodepro" -> "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap";
            default              -> "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap";
        };
    }

    private String getFontCssStack(String fontFamily) {
        return switch (fontFamily) {
            case "roboto"        -> "'Roboto','Helvetica Neue',Arial,sans-serif";
            case "lato"          -> "'Lato','Helvetica Neue',Arial,sans-serif";
            case "merriweather"  -> "'Merriweather',Georgia,'Times New Roman',serif";
            case "sourcecodepro" -> "'Source Code Pro','Courier New',Courier,monospace";
            default              -> "'Inter',system-ui,-apple-system,sans-serif";
        };
    }

    private String humanizeSkillType(String type, String lang) {
        return switch (lang) {
            case "ru" -> switch (type) {
                case "SOFT"         -> "Мягкие навыки";
                case "HARD"         -> "Технические навыки";
                case "LANGUAGES"    -> "Языки программирования";
                case "FRAMEWORKS"   -> "Фреймворки";
                case "FRONTEND"     -> "Frontend";
                case "BACKEND"      -> "Backend";
                case "DATABASES"    -> "Базы данных";
                case "DEVOPS"       -> "DevOps";
                case "CLOUD"        -> "Облако";
                case "TOOLS"        -> "Инструменты";
                case "TESTING"      -> "Тестирование";
                case "ARCHITECTURE" -> "Архитектура";
                case "METHODOLOGY"  -> "Методология";
                case "MAIN"         -> "Основные";
                default             -> type;
            };
            case "et" -> switch (type) {
                case "SOFT"         -> "Pehmed oskused";
                case "HARD"         -> "Tehnilised oskused";
                case "LANGUAGES"    -> "Programmeerimiskeeled";
                case "FRAMEWORKS"   -> "Raamistikud";
                case "FRONTEND"     -> "Frontend";
                case "BACKEND"      -> "Backend";
                case "DATABASES"    -> "Andmebaasid";
                case "DEVOPS"       -> "DevOps";
                case "CLOUD"        -> "Pilv";
                case "TOOLS"        -> "Tööriistad";
                case "TESTING"      -> "Testimine";
                case "ARCHITECTURE" -> "Arhitektuur";
                case "METHODOLOGY"  -> "Metoodika";
                case "MAIN"         -> "Peamised";
                default             -> type;
            };
            default -> switch (type) {
                case "SOFT"         -> "Soft skills";
                case "HARD"         -> "Hard skills";
                case "LANGUAGES"    -> "Languages";
                case "FRAMEWORKS"   -> "Frameworks";
                case "FRONTEND"     -> "Frontend";
                case "BACKEND"      -> "Backend";
                case "DATABASES"    -> "Databases";
                case "DEVOPS"       -> "DevOps";
                case "CLOUD"        -> "Cloud";
                case "TOOLS"        -> "Tools";
                case "TESTING"      -> "Testing";
                case "ARCHITECTURE" -> "Architecture";
                case "METHODOLOGY"  -> "Methodology";
                case "MAIN"         -> "Main";
                default             -> type;
            };
        };
    }

    private Map<String, String> getLabels(String lang) {
        return switch (lang) {
            case "et" -> Map.of(
                "summary",       "Kokkuvõte",
                "experience",    "Töökogemus",
                "projects",      "Projektid",
                "education",     "Haridus",
                "skills",        "Oskused",
                "strengths",     "Tugevused",
                "languages",     "Keeled",
                "certificates",  "Sertifikaadid",
                "driverLicense", "Juhiluba"
            );
            case "ru" -> Map.of(
                "summary",       "О себе",
                "experience",    "Опыт работы",
                "projects",      "Проекты",
                "education",     "Образование",
                "skills",        "Навыки",
                "strengths",     "Сильные стороны",
                "languages",     "Языки",
                "certificates",  "Сертификаты",
                "driverLicense", "Водительские права"
            );
            default -> Map.of(
                "summary",       "Summary",
                "experience",    "Experience",
                "projects",      "Projects",
                "education",     "Education",
                "skills",        "Skills",
                "strengths",     "Strengths",
                "languages",     "Languages",
                "certificates",  "Certificates",
                "driverLicense", "Driver License"
            );
        };
    }

    private byte[] convertToPdf(String html) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useSVGDrawer(new BatikSVGDrawer()); 
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }
}
