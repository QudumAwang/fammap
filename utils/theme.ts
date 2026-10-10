export const FAMILY_TREE_THEMES = [
  { value: "claymorphism", label: "Claymorphism" },
  { value: "glassmorphism", label: "Glassmorphism" },
  { value: "liquid-glassmorphism", label: "Liquid Glass" },
  { value: "neumorphism", label: "Neumorphism" },
  { value: "skeuomorphism", label: "Skeuomorphism" },
] as const;

export type FamilyTreeTheme = (typeof FAMILY_TREE_THEMES)[number]["value"];
export type FamilyTreeMode = "light" | "dark";

export interface FamilyTreeAppearance {
  theme: FamilyTreeTheme;
  mode: FamilyTreeMode;
}

const THEME_SESSION_KEY = "fammap-theme";
const MODE_STORAGE_KEY = "fammap-mode";
const DEFAULT_APPEARANCE: FamilyTreeAppearance = { theme: "claymorphism", mode: "light" };
const listeners = new Set<() => void>();
let appearance: FamilyTreeAppearance | undefined;

function getAppearance(): FamilyTreeAppearance {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  if (appearance) return appearance;

  const savedTheme = sessionStorage.getItem(THEME_SESSION_KEY);
  const theme = FAMILY_TREE_THEMES.find((option) => option.value === savedTheme)?.value
    ?? FAMILY_TREE_THEMES[Math.floor(Math.random() * FAMILY_TREE_THEMES.length)].value;
  const mode = localStorage.getItem(MODE_STORAGE_KEY) === "dark" ? "dark" : "light";
  appearance = { theme, mode };
  sessionStorage.setItem(THEME_SESSION_KEY, theme);
  document.documentElement.dataset.fammapTheme = theme;
  document.documentElement.dataset.fammapMode = mode;
  return appearance;
}

function updateAppearance(next: FamilyTreeAppearance) {
  appearance = next;
  document.documentElement.dataset.fammapTheme = next.theme;
  document.documentElement.dataset.fammapMode = next.mode;
  sessionStorage.setItem(THEME_SESSION_KEY, next.theme);
  localStorage.setItem(MODE_STORAGE_KEY, next.mode);
  listeners.forEach((listener) => listener());
}

export function subscribeToFamilyTreeAppearance(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getFamilyTreeAppearance() {
  return getAppearance();
}

export function getServerFamilyTreeAppearance() {
  return DEFAULT_APPEARANCE;
}

export function getFamilyTreeTheme(): FamilyTreeTheme {
  return getAppearance().theme;
}

export function setFamilyTreeTheme(theme: FamilyTreeTheme) {
  updateAppearance({ ...getAppearance(), theme });
}

export function getFamilyTreeMode(): FamilyTreeMode {
  return getAppearance().mode;
}

export function setFamilyTreeMode(mode: FamilyTreeMode) {
  updateAppearance({ ...getAppearance(), mode });
}
