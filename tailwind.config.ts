import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold:        "#a8862c",
        "gold-light":"#c9a84c",
        "gold-dim":  "rgba(168,134,44,0.10)",
        "gold-mid":  "rgba(168,134,44,0.32)",
        bg:          "#f3f2ee",
        bg2:         "#ffffff",
        bg3:         "#ebeae5",
        bg4:         "#e3e1da",
        border:      "rgba(20,18,12,0.09)",
        "border-h":  "rgba(20,18,12,0.22)",
        ink:         "#1c1a14",
        muted:       "#8a8780",
        mid:         "#5a574f",
        up:          "#15803d",
        down:        "#b91c1c",
        sky:         "#2563eb",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
