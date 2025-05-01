"use client";

import { createContext, useContext, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useSettings } from "./SettingsContext";

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  const { settings, updateAppearanceSettings } = useSettings();

  // Sync theme provider with settings
  useEffect(() => {
    if (settings.appearance.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.appearance.darkMode]);

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={settings.appearance.darkMode ? "dark" : "light"}
    >
      {children}
    </NextThemesProvider>
  );
}
