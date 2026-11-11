"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isClicking, setIsClicking] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Safely determine dark mode state
  const isDark = mounted ? resolvedTheme === "dark" : false

  const toggleTheme = () => {
    setIsClicking(true)
    setTheme(isDark ? "light" : "dark")
    setTimeout(() => setIsClicking(false), 300)
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
          Theme:
        </span>
      )}

      {/* 2-Position Animated Sliding Pill Switch (Light / Dark) */}
      <div
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle light and dark mode"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        className={`group relative inline-flex items-center justify-between h-8 w-[64px] p-1 rounded-full cursor-pointer overflow-hidden border transition-all duration-500 ease-out shadow-inner ${
          isDark
            ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-zinc-900 border-indigo-500/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
            : "bg-gradient-to-r from-amber-100/90 via-sky-100/60 to-slate-200 border-amber-300/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
        }`}
      >
        {/* Ambient Sky Details: Night Stars (Dark Mode) */}
        <span
          className={`absolute top-1.5 left-2 size-1 rounded-full bg-indigo-200/90 transition-all duration-500 pointer-events-none ${
            isDark ? "opacity-100 scale-100 animate-pulse" : "opacity-0 scale-0 -translate-x-2"
          }`}
        />
        <span
          className={`absolute bottom-2 left-4 size-0.5 rounded-full bg-violet-300/80 transition-all duration-500 pointer-events-none delay-75 ${
            isDark ? "opacity-100 scale-100" : "opacity-0 scale-0 -translate-y-1"
          }`}
        />

        {/* Ambient Sky Details: Morning Glow (Light Mode) */}
        <span
          className={`absolute top-1.5 right-2 size-2 rounded-full bg-amber-400/40 blur-[2px] transition-all duration-500 pointer-events-none ${
            !isDark ? "opacity-100 scale-125" : "opacity-0 scale-50 translate-x-2"
          }`}
        />

        {/* Animated Sliding Thumb with Bouncy Spring Physics */}
        <span
          aria-hidden="true"
          className={`absolute top-1 left-1 h-6 w-6 rounded-full pointer-events-none z-0 transition-transform duration-350 ${
            isDark ? "translate-x-[32px]" : "translate-x-0"
          } ${isClicking ? "scale-90" : "scale-100"}`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Thumb Surface & Glow Aura */}
          <span
            className={`block w-full h-full rounded-full transition-all duration-300 ${
              isDark
                ? "bg-zinc-950 border border-indigo-400/40 shadow-[0_0_12px_rgba(129,140,248,0.45)] ring-1 ring-white/10"
                : "bg-white border border-amber-200/80 shadow-[0_2px_8px_rgba(245,158,11,0.3)] ring-1 ring-black/5"
            }`}
          />
        </span>

        {/* 1. Light Mode Option (Sun) */}
        <button
          type="button"
          aria-label="Light mode"
          title="Light mode"
          onClick={(e) => {
            e.stopPropagation()
            if (isDark) toggleTheme()
          }}
          className="relative z-10 h-6 w-6 flex items-center justify-center rounded-full cursor-pointer focus:outline-none"
        >
          <Sun
            className={`size-3.5 transition-all duration-500 ease-out ${
              !isDark
                ? "rotate-0 scale-110 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]"
                : "-rotate-90 scale-75 text-slate-400/50 opacity-40 group-hover:opacity-70 group-hover:rotate-[-45deg]"
            }`}
          />
        </button>

        {/* 2. Dark Mode Option (Moon) */}
        <button
          type="button"
          aria-label="Dark mode"
          title="Dark mode"
          onClick={(e) => {
            e.stopPropagation()
            if (!isDark) toggleTheme()
          }}
          className="relative z-10 h-6 w-6 flex items-center justify-center rounded-full cursor-pointer focus:outline-none"
        >
          <Moon
            className={`size-3.5 transition-all duration-500 ease-out ${
              isDark
                ? "rotate-0 scale-110 text-indigo-300 drop-shadow-[0_0_6px_rgba(165,180,252,0.8)]"
                : "rotate-90 scale-75 text-slate-400/50 opacity-40 group-hover:opacity-70 group-hover:rotate-[45deg]"
            }`}
          />
        </button>
      </div>
    </div>
  )
}
