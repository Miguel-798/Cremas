"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDarkModeReturn {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * useDarkMode - Centralized dark mode hook
 * Reads/writes localStorage + toggles 'dark' class on <html>
 */
export function useDarkMode(): UseDarkModeReturn {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setIsDarkMode(saved === "true");
    } else {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode, mounted]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return { isDarkMode, toggleDarkMode };
}
