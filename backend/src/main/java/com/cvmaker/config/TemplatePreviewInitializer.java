package com.cvmaker.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Map;

@Component
public class TemplatePreviewInitializer implements ApplicationRunner {

    private static final Map<String, String> TEMPLATES = Map.of(
            "classic", "Classic",
            "minimal", "Minimal",
            "sidebar", "Sidebar"
    );

    @Override
    public void run(ApplicationArguments args) {
        File dir = new File("./template-previews");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        TEMPLATES.forEach((id, name) -> {
            File file = new File(dir, id + ".png");
            if (!file.exists()) {
                try {
                    generatePreview(id, name, file);
                } catch (IOException e) {
                    System.err.println("Failed to generate preview for " + id + ": " + e.getMessage());
                }
            }
        });
    }

    private void generatePreview(String id, String name, File outputFile) throws IOException {
        int width = 400;
        int height = 565;

        BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Background
        g.setColor(new Color(0xF8F8F8));
        g.fillRect(0, 0, width, height);

        // Header strip
        Color headerColor = id.equals("sidebar") ? new Color(0x2C3E50) : new Color(0xE8E8E8);
        g.setColor(headerColor);
        g.fillRect(0, 0, width, 90);

        // Sidebar strip for sidebar template
        if (id.equals("sidebar")) {
            g.setColor(new Color(0x2C3E50));
            g.fillRect(0, 0, 130, height);
            g.setColor(new Color(0xF8F8F8));
            g.fillRect(130, 0, width - 130, height);
        }

        // Placeholder text lines to suggest content
        g.setColor(new Color(0xDDDDDD));
        int lineX = id.equals("sidebar") ? 145 : 30;
        int lineWidth = id.equals("sidebar") ? 220 : 300;
        for (int y = 110; y < 520; y += 22) {
            int lw = (y % 44 == 0) ? lineWidth - 60 : lineWidth;
            g.fillRoundRect(lineX, y, lw, 7, 3, 3);
        }
        if (id.equals("sidebar")) {
            g.setColor(new Color(0x3D5166));
            for (int y = 110; y < 520; y += 22) {
                g.fillRoundRect(10, y, 95, 7, 3, 3);
            }
        }

        // Template name
        Color textColor = (id.equals("classic") || id.equals("minimal"))
                ? new Color(0x444444)
                : new Color(0xFFFFFF);
        g.setColor(textColor);
        g.setFont(new Font("SansSerif", Font.BOLD, 22));
        FontMetrics fm = g.getFontMetrics();
        int textX = id.equals("sidebar") ? (130 - fm.stringWidth(name)) / 2 : (width - fm.stringWidth(name)) / 2;
        int textY = 55;
        g.drawString(name, textX, textY);

        // Border
        g.setColor(new Color(0xCCCCCC));
        g.drawRect(0, 0, width - 1, height - 1);

        g.dispose();
        ImageIO.write(img, "PNG", outputFile);
    }
}
