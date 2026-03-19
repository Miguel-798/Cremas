"use client";

import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

/**
 * DarkModeToggle - Toggle button for dark/light mode
 * Uses centralized useDarkMode hook
 */
export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-peach-500" />
      ) : (
        <Moon className="w-5 h-5 text-espresso-600" />
      )}
    </button>
  );
}
