import type { Config } from "tailwindcss";

const config: {
  plugins: any[];
  theme: {
    extend: {
      dropShadow: { custom: string };
      letterSpacing: { 20: string };
      lineHeight: { 25: string; 15: string; 60: string; 50: string };
      colors: { background: string; foreground: string }
    }
  };
  content: string[]
} = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      letterSpacing: {
        20: "0.2em",
      },
      lineHeight:{
        25: "25.2px",
        50: "50.4px",
        60: "60.48px",
        15:"15.12px"
      },
      dropShadow: {
        'custom': '0 8px 16px rgba(255, 165, 0, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;
