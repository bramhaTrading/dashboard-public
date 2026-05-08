import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#0a0a0a",
        surface:   "#1a1a1a",
        elevated:  "#222222",
        border:    "rgba(255,255,255,0.08)",
        text:      "#f5f5f5",
        muted:     "#999999",
        faint:     "#555555",
        green:     "#34d399",
        red:       "#f87171",
        gold:      "#c9a84c",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
