"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/shared/hooks/use-theme";
import { cn } from "@/shared/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className={cn(
        "text-muted-foreground border-line hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-md border",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}
