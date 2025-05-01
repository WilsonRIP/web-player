"use client";

import { useEffect } from "react";
import { useSettings } from "./SettingsContext";

const THEME_PREFIX = "theme-";

export function ThemeApplicator() {
  const {
    settings: {
      appearance: { theme },
    },
  } = useSettings();

  useEffect(() => {
    const body = document.body;

    // Remove previous theme classes
    body.classList.forEach((className) => {
      if (className.startsWith(THEME_PREFIX)) {
        body.classList.remove(className);
      }
    });

    // Add the new theme class if it's not default
    if (theme && theme !== "default") {
      body.classList.add(`${THEME_PREFIX}${theme}`);
    }
  }, [theme]);

  return null; // This component doesn't render anything itself
}
