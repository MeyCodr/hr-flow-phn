// Single source of truth for the "What's New" popup shown on the login page.
// Bump APP_VERSION and update `highlights` whenever you want returning users
// to see a fresh update notice (the popup keys off this string via
// localStorage, so any change here — not just the number — retriggers it).
export const APP_VERSION = "1.1.0";

export const RELEASE_HIGHLIGHTS: string[] = [
  "New dark mode — toggle it from the top bar",
  "Refreshed sidebar and navigation design",
  "General bug fixes and performance improvements",
];
