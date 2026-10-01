/**
 * A skill's type is free text. It is either one of the built-in keys below —
 * which carry a translated heading in the exported CV — or a label the user
 * typed themselves, which is shown and exported exactly as typed.
 */

export const BUILT_IN_SKILL_TYPES = [
  "LANGUAGES", "FRAMEWORKS", "FRONTEND", "BACKEND",
  "DATABASES", "DEVOPS", "CLOUD", "TOOLS",
  "TESTING", "ARCHITECTURE", "METHODOLOGY",
  "SOFT", "MAIN", "HARD", "OTHER",
] as const;

export type BuiltInSkillType = (typeof BUILT_IN_SKILL_TYPES)[number];

const BUILT_IN_LABELS: Record<BuiltInSkillType, string> = {
  LANGUAGES: "Languages",
  FRAMEWORKS: "Frameworks",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASES: "Databases",
  DEVOPS: "DevOps",
  CLOUD: "Cloud",
  TOOLS: "Tools",
  TESTING: "Testing",
  ARCHITECTURE: "Architecture",
  METHODOLOGY: "Methodology",
  SOFT: "Soft skills",
  MAIN: "Main",
  HARD: "Hard skills",
  OTHER: "Other",
};

const BUILT_IN_COLORS: Record<BuiltInSkillType, string> = {
  LANGUAGES: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  FRAMEWORKS: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  FRONTEND: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  BACKEND: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  DATABASES: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  DEVOPS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CLOUD: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  TOOLS: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  TESTING: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ARCHITECTURE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  METHODOLOGY: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  SOFT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MAIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  HARD: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  OTHER: "bg-muted text-muted-foreground",
};

/** Badge colors for custom types, picked by name so a type keeps its color. */
const CUSTOM_COLORS = [
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
  "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400",
];

export function isBuiltInSkillType(type: string): type is BuiltInSkillType {
  return (BUILT_IN_SKILL_TYPES as readonly string[]).includes(type);
}

export function skillTypeLabel(type: string): string {
  return isBuiltInSkillType(type) ? BUILT_IN_LABELS[type] : type;
}

export function skillTypeColor(type: string): string {
  if (isBuiltInSkillType(type)) return BUILT_IN_COLORS[type];
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) | 0;
  return CUSTOM_COLORS[Math.abs(hash) % CUSTOM_COLORS.length];
}

/**
 * Mirrors the backend: a custom label that spells a built-in key folds onto it,
 * so "Tools" does not become a second heading next to the built-in Tools.
 */
export function normalizeSkillType(type: string): string {
  const trimmed = type.trim();
  const upper = trimmed.toUpperCase();
  return isBuiltInSkillType(upper) ? upper : trimmed;
}
