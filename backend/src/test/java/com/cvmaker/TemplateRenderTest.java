package com.cvmaker;

import com.cvmaker.dto.response.CvResponse;
import org.junit.jupiter.api.Test;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

class TemplateRenderTest {

    private static SpringTemplateEngine engine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }

    private static CvResponse sampleCv() {
        return new CvResponse(
                1L, "Test CV", "classic", "Jane", "Doe", "jane@example.com", "+372 1234567",
                "Tallinn", "github.com/jane", "linkedin.com/in/jane", null, null,
                "Backend engineer.", "B", null, "en", "inter", 10,
                LocalDateTime.now(), LocalDateTime.now(),
                List.of(new CvResponse.SkillResponse(1L, "LANGUAGES", "Java", 0, true)),
                List.of(
                        new CvResponse.StrengthResponse(1L, "Fast learner", 0),
                        new CvResponse.StrengthResponse(2L, "Team player", 1)
                ),
                List.of(new CvResponse.LanguageResponse(1L, "English", "C1", 0)),
                List.of(new CvResponse.ExperienceResponse(
                        1L, "Acme", "Senior Dev", "Tallinn", "Jan 2022", null, true,
                        "Led a team of four.",
                        List.of("Cut response time by 40%", "Introduced CI/CD"),
                        List.of("Java", "Spring"), 0)),
                List.of(new CvResponse.ProjectResponse(
                        1L, "CV Maker", "github.com/jane/cv", "Resume builder.",
                        List.of("Built the REST API"), List.of("Next.js"), 0)),
                List.of(new CvResponse.EducationResponse(
                        1L, "TalTech", "BSc", "Computer Science", "2018", "2022", false, null, 0)),
                List.of(new CvResponse.CertificateResponse(1L, "AWS SAA", "Amazon", "2024", null, 0))
        );
    }

    private static Context context() {
        Map<String, List<String>> skillsByType = new LinkedHashMap<>();
        skillsByType.put("Languages", List.of("Java"));

        Context ctx = new Context();
        ctx.setVariable("cv", sampleCv());
        ctx.setVariable("skillsByType", skillsByType);
        ctx.setVariable("skillsFlat", List.<String>of());
        ctx.setVariable("sectionOrder",
                List.of("experience", "projects", "education", "skills", "strengths", "languages", "certificates"));
        ctx.setVariable("labels", Map.of(
                "summary", "Summary", "experience", "Experience", "projects", "Projects",
                "education", "Education", "skills", "Skills", "strengths", "Strengths",
                "languages", "Languages", "certificates", "Certificates", "driverLicense", "Driver License"));
        ctx.setVariable("fontImportUrl", "https://fonts.googleapis.com/css2?family=Inter&display=swap");
        ctx.setVariable("fontCssStack", "'Inter',sans-serif");
        ctx.setVariable("fontSizePt", 10);
        return ctx;
    }

    @Test
    void rendersAllTemplatesWithStrengthsAndExperienceBullets() {
        for (String template : List.of("classic", "minimal", "sidebar")) {
            String html = engine().process("cv-templates/" + template, context());
            System.out.println("=== " + template + " : " + html.length() + " chars ===");
            assertTrue(html.contains("Strengths"), template + " is missing the Strengths heading");
            assertTrue(html.contains("Fast learner"), template + " is missing strength items");
            assertTrue(html.contains("Cut response time by 40%"), template + " is missing experience bullets");
        }
    }
}
