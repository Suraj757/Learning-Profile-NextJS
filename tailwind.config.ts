import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Begin Learning Brand Colors
        'begin': {
          'blue': '#0B3064',
          'teal': '#007A72',
          'teal-hover': '#00625B',
          'cream': '#FFF9EF',
          'cyan': '#00D1FF',
          'light-blue': '#B1E2FE',
          'gray': '#EBECEC',
        },
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.1' }],
        'hero': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2' }],
        'heading-lg': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.3' }],
        'heading': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.4' }],
        'body-lg': ['clamp(1.125rem, 2vw, 1.25rem)', { lineHeight: '1.6' }],
        'body': ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.6' }],
      },
      borderRadius: {
        'begin': '48px',
        'card': '16px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}

export default config;