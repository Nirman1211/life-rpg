import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#08090d",
        foreground: "#f3f4f6",
        card: {
          DEFAULT: "#11131c",
          foreground: "#f3f4f6",
          border: "#1f2438",
        },
        rpg: {
          dark: "#08090d",
          panel: "#11131c",
          panelHover: "#181b28",
          border: "#20263b",
          borderGlow: "#3b4568",
          gold: "#fbbf24",
          goldMuted: "#b45309",
          cyan: "#00f0ff",
          cyanGlow: "#00f0ff40",
          purple: "#a855f7",
          purpleGlow: "#a855f740",
          crimson: "#ef4444",
          crimsonGlow: "#ef444440",
          emerald: "#10b981",
          emeraldGlow: "#10b98140",
          sapphire: "#3b82f6",
        },
      },
      boxShadow: {
        "rpg-card": "0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "rpg-glow-cyan": "0 0 20px rgba(0, 240, 255, 0.35)",
        "rpg-glow-gold": "0 0 20px rgba(251, 191, 36, 0.4)",
        "rpg-glow-purple": "0 0 20px rgba(168, 85, 247, 0.35)",
        "rpg-glow-crimson": "0 0 20px rgba(239, 68, 68, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "rpg-hero-mesh": "radial-gradient(at 10% 20%, rgba(0, 240, 255, 0.12) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(168, 85, 247, 0.12) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(251, 191, 36, 0.06) 0px, transparent 50%)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 12px rgba(0,240,255,0.6))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 4px rgba(0,240,255,0.2))" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "float-slow": "floatSlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
