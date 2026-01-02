import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        display: ["\"Space Grotesk\"", "ui-sans-serif", "system-ui"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        ink: "#0b0f1a",
        mist: "#f3f5f7",
        ember: "#f36b3f",
        teal: "#1aa6a6",
        midnight: "#111827",
      },
      boxShadow: {
        glow: "0 0 30px rgba(243, 107, 63, 0.35)",
        card: "0 18px 60px rgba(15, 23, 42, 0.16)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        float: "float 10s ease-in-out infinite",
        rise: "rise 0.6s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
