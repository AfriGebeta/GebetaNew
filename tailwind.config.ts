const config: {
  plugins: any[];
  theme: {
    extend: {
      dropShadow: { custom: string };
      keyframes: { scroll: { "100%": { transform: string }; "0%": { transform: string } } };
      backgroundImage: { custom: string };
      letterSpacing: { 20: string };
      lineHeight: { 25: string; 15: string; 17: string; 60: string; 50: string };
      colors: { background: string; foreground: string };
      animation: { scroll: string }
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
        15:"15.12px",
        17:"17.64px",
      },
      dropShadow: {
        'custom': '0 8px 16px rgba(255, 165, 0, 0.15)',
      },
      backgroundImage:{
        "custom": 'linear-gradient(179.416deg, rgba(255, 255, 255, 0%) 0%, rgba(255, 165, 0, 0%) 30%, rgba(255, 165, 0, 0.3) 100%)',
      },
      animation: {
        'scroll': 'scroll 60s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-256px * 5 - 32px * 5))' },
        }
      }
    },
  },
  plugins: [],
};
export default config;


