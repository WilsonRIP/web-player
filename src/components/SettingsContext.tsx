"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Define the settings type
export interface Settings {
  general: {
    autoplay: boolean;
    notifications: boolean;
    language: string;
  };
  playback: {
    defaultVolume: number;
    defaultSpeed: string;
    loop: boolean;
    skipIntro: boolean;
  };
  appearance: {
    darkMode: boolean;
    theme: string;
    subtitles: boolean;
    playerSize: string;
  };
}

// Default settings
export const defaultSettings: Settings = {
  general: {
    autoplay: false,
    notifications: true,
    language: "english",
  },
  playback: {
    defaultVolume: 75,
    defaultSpeed: "1",
    loop: false,
    skipIntro: false,
  },
  appearance: {
    darkMode: false,
    theme: "default",
    subtitles: true,
    playerSize: "medium",
  },
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  updateGeneralSettings: (key: keyof Settings["general"], value: any) => void;
  updatePlaybackSettings: (key: keyof Settings["playback"], value: any) => void;
  updateAppearanceSettings: (
    key: keyof Settings["appearance"],
    value: any
  ) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("webPlayerSettings");
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error("Error parsing settings:", error);
          setSettings(defaultSettings);
        }
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("webPlayerSettings", JSON.stringify(settings));
    }
  }, [settings]);

  // Update settings helpers
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const updateGeneralSettings = (
    key: keyof Settings["general"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value,
      },
    }));
  };

  const updatePlaybackSettings = (
    key: keyof Settings["playback"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      playback: {
        ...prev.playback,
        [key]: value,
      },
    }));
  };

  const updateAppearanceSettings = (
    key: keyof Settings["appearance"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const value = {
    settings,
    updateSettings,
    updateGeneralSettings,
    updatePlaybackSettings,
    updateAppearanceSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
