"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return (
      <button
        className="theme-toggle"
        aria-label="تغییر تم"
        style={{ visibility: "hidden" }}
      >
        <span className="theme-toggle-icon">☀️</span>
      </button>
    );
  }

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="تغییر تم">
      <span className="theme-toggle-icon">{dark ? "🌙" : "☀️"}</span>
    </button>
  );
}
