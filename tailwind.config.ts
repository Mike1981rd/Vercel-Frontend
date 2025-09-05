import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
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
        // Materialize Design System Colors
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Main primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Sidebar colors
        sidebar: {
          bg: '#1a1b2e',
          bgHover: '#252642',
          text: '#ffffff',
          textSecondary: '#9ca3af',
          active: '#6366f1',
        },
        // Success, Warning, Error
        success: {
          50: '#f0fdf4',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // UI Colors
        card: {
          bg: '#ffffff',
          border: '#e2e8f0',
        },
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
          muted: '#94a3b8',
        }
      },
      // Custom spacing for layout
      spacing: {
        'sidebar': '280px',
        'sidebar-collapsed': '80px',
        'navbar': '64px',
      },
      // Custom shadows matching Materialize
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'navbar': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'sidebar': '2px 0 8px 0 rgb(0 0 0 / 0.1)',
      },
      // Border radius
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      // Typography
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      // Scale utilities
      scale: {
        '102': '1.02',
      },
      // Animations
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
