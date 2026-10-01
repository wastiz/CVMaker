package com.cvmaker;

import com.cvmaker.entity.SkillTypes;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SkillTypesTest {

    @Test
    void keepsCustomLabelAsTyped() {
        assertEquals("Game Engines", SkillTypes.normalize("  Game Engines  "));
        assertFalse(SkillTypes.isBuiltIn("Game Engines"));
    }

    @Test
    void foldsCustomLabelOntoBuiltInKeyItSpells() {
        assertEquals("TOOLS", SkillTypes.normalize("Tools"));
        assertEquals("TOOLS", SkillTypes.normalize("tools"));
        assertTrue(SkillTypes.isBuiltIn(SkillTypes.normalize("Tools")));
    }

    @Test
    void passesBuiltInKeysThrough() {
        SkillTypes.BUILT_IN.forEach(key -> {
            assertEquals(key, SkillTypes.normalize(key));
            assertTrue(SkillTypes.isBuiltIn(key));
        });
    }
}
