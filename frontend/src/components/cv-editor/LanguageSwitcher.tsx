"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cvApi } from "@/api/cvApi";
import { useCvStore } from "@/store/cvStore";
import { cn } from "@/lib/utils";

const LANGS = ["en", "et", "ru"] as const;
type Lang = (typeof LANGS)[number];
const LABELS: Record<Lang, string> = { en: "EN", et: "ET", ru: "RU" };

interface Props {
  cvId: number;
  currentLang?: string;
}

export function LanguageSwitcher({ cvId, currentLang = "en" }: Props) {
  const { setCv } = useCvStore();
  const [saving, setSaving] = useState(false);

  async function handleChange(lang: Lang) {
    if (lang === currentLang || saving) return;
    setSaving(true);
    try {
      const { data } = await cvApi.patch(cvId, { templateLanguage: lang });
      setCv(data);
    } catch {
      toast.error("Failed to update PDF language");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="flex shrink-0 items-center rounded-md border border-border bg-muted/30 p-0.5 gap-0.5"
      title="PDF label language"
    >
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => handleChange(lang)}
          disabled={saving}
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium transition-colors disabled:opacity-50",
            currentLang === lang
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
