import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-devanagari)', 'sans-serif'],
        devanagari: ['var(--font-noto-devanagari)', 'sans-serif'],
      },
      colors: {
        pastel: {
          lavender: "#EDE9FE",
          mint: "#E6F4EA",
          peach: "#FEE2E2",
          sky: "#E0F2FE",
          cream: "#FEF9F3",
        },
        clay: {
          primary: "#6366F1",
          secondary: "#10B981",
          accent: "#F43F5E",
          amber: "#F59E0B",
          surface: "#F3F4F9",
        }
      },
      boxShadow: {
        // Claymorphism: soft 3D inflated look with inner rim light
        'clay-sm': '4px 4px 8px rgba(165, 160, 195, 0.35), -4px -4px 8px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.7), inset -1px -1px 2px rgba(0, 0, 0, 0.05)',
        'clay-md': '8px 8px 16px rgba(165, 160, 195, 0.35), -8px -8px 16px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(0, 0, 0, 0.06)',
        'clay-lg': '14px 14px 28px rgba(165, 160, 195, 0.35), -14px -14px 28px rgba(255, 255, 255, 0.9), inset 3px 3px 6px rgba(255, 255, 255, 0.8), inset -3px -3px 6px rgba(0, 0, 0, 0.08)',
        'clay-mic': '0 20px 40px rgba(99, 102, 241, 0.35), 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -4px 6px rgba(0, 0, 0, 0.2)',
        'clay-mic-active': '0 0 50px rgba(244, 63, 94, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -4px 8px rgba(0, 0, 0, 0.25)',
        // Neumorphism: soft debossed / embossed fields
        'neu-inset': 'inset 3px 3px 6px rgba(165, 160, 195, 0.35), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
        'neu-inset-dark': 'inset 3px 3px 6px rgba(0, 0, 0, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.05)',
        // Glassmorphism soft glow shadow
        'glass-glow': '0 8px 32px 0 rgba(100, 100, 180, 0.12)',
        'glass-glow-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.05)" },
        }
      },
      animation: {
        blob: "blob 9s infinite ease-in-out",
        "blob-slow": "blob 14s infinite ease-in-out",
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
      }
    },
  },
  plugins: [],
};
export default config;
