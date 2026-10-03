import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: "#e0e5ec",
          surface: "#e0e5ec",
          dark: "#a3b1c6",
        },
      },
      boxShadow: {
        clay: "8px 8px 16px rgba(0,0,0,0.1), inset -6px -6px 12px rgba(0,0,0,0.1), inset 6px 6px 12px rgba(255,255,255,0.8)",
        "clay-active": "inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
