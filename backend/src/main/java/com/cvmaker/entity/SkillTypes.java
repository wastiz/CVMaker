package com.cvmaker.entity;

import java.util.List;
import java.util.Set;

/**
 * A skill's type is free text: either one of the built-in keys below, which
 * carry translated headings in the rendered CV, or a label the user typed
 * themselves, which is rendered exactly as typed.
 */
public final class SkillTypes {

    public static final List<String> BUILT_IN = List.of(
            "LANGUAGES", "FRAMEWORKS", "FRONTEND", "BACKEND",
            "DATABASES", "DEVOPS", "CLOUD", "TOOLS",
            "TESTING", "ARCHITECTURE", "METHODOLOGY",
            "SOFT", "MAIN", "HARD", "OTHER"
    );

    private static final Set<String> BUILT_IN_KEYS = Set.copyOf(BUILT_IN);

    private SkillTypes() {}

    public static boolean isBuiltIn(String type) {
        return type != null && BUILT_IN_KEYS.contains(type);
    }

    /**
     * Trims a submitted type and folds it onto a built-in key when it names one
     * (so a hand-typed "Tools" groups with the built-in TOOLS instead of
     * forming a second heading). Any other label is kept verbatim.
     */
    public static String normalize(String type) {
        if (type == null) return null;
        String trimmed = type.trim();
        String upper = trimmed.toUpperCase();
        return BUILT_IN_KEYS.contains(upper) ? upper : trimmed;
    }
}
