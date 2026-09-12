"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeName = "cyberpunk" | "arcane" | "emerald" | "neon" | "midnight";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "cyberpunk",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  initialTheme = "cyberpunk",
}: {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);

  useEffect(() => {
    const saved = localStorage.getItem("liferpg_theme") as ThemeName;
    if (saved && ["cyberpunk", "arcane", "emerald", "neon", "midnight"].includes(saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, [initialTheme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem("liferpg_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    // Sync to backend settings silently
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
