"use client";

import { useTheme } from "../../services/theme/ThemeContext";

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30 text-on-surface transition-all shadow-sm group"
      title={`Current theme: ${theme} (Click to change)`}
    >
      {resolvedTheme === "dark" ? (
        <span className="material-symbols-outlined text-[16px] text-tertiary group-hover:scale-110 transition-transform">
          dark_mode
        </span>
      ) : (
        <span className="material-symbols-outlined text-[16px] text-amber-500 group-hover:scale-110 transition-transform">
          light_mode
        </span>
      )}
    </button>
  );
}
