// sigp-it/tailwind.config.ts
import type { Config } from "tailwindcss";

/**
 * SIGP-IT — Tailwind Config
 * Extiende Tailwind con los tokens del design system de SIGP-IT.
 * Los valores aquí mapean 1:1 con las variables CSS de globals.css,
 * para poder usar tanto clases Tailwind como var() CSS según contexto.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ── Colores semánticos ── */
      colors: {
        /* Superficies */
        bg: "var(--color-bg)",
        sidebar: "var(--color-sidebar)",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
          3: "var(--color-surface-3)",
          hover: "var(--color-surface-hover)",
        },

        /* Bordes */
        border: {
          subtle: "var(--color-border-subtle)",
          DEFAULT: "var(--color-border)",
          medium: "var(--color-border-medium)",
        },

        /* Texto */
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          faint: "var(--color-text-faint)",
          inverse: "var(--color-text-inverse)",
        },

        /* Acento */
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          active: "var(--color-accent-active)",
          subtle: "var(--color-accent-subtle)",
          border: "var(--color-accent-border)",
          glow: "var(--color-accent-glow)",
        },

        /* Estados */
        success: {
          DEFAULT: "var(--color-success)",
          bg: "var(--color-success-bg)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg: "var(--color-warning-bg)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          bg: "var(--color-error-bg)",
        },

        /* Roles */
        role: {
          estudiante: "var(--color-role-estudiante)",
          "estudiante-bg": "var(--color-role-estudiante-bg)",
          universidad: "var(--color-role-universidad)",
          "universidad-bg": "var(--color-role-universidad-bg)",
          empresa: "var(--color-role-empresa)",
          "empresa-bg": "var(--color-role-empresa-bg)",
        },

        /* Avatares */
        avatar: {
          estudiante: "var(--color-avatar-estudiante)",
          universidad: "var(--color-avatar-universidad)",
          empresa: "var(--color-avatar-empresa)",
        },
      },

      /* ── Tipografía ── */
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        body: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },

      fontSize: {
        xs: ["clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)", { lineHeight: "1.5" }],
        sm: ["clamp(0.8125rem, 0.78rem + 0.2vw, 0.875rem)", { lineHeight: "1.5" }],
        base: ["clamp(0.875rem, 0.85rem + 0.15vw, 0.9375rem)", { lineHeight: "1.6" }],
        lg: ["clamp(1rem, 0.95rem + 0.25vw, 1.125rem)", { lineHeight: "1.4" }],
        xl: ["clamp(1.125rem, 1rem + 0.5vw, 1.375rem)", { lineHeight: "1.3" }],
        "2xl": ["clamp(1.375rem, 1.2rem + 0.75vw, 1.75rem)", { lineHeight: "1.2" }],
      },

      /* ── Espaciado (complementa el sistema 4px base de Tailwind) ── */
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
      },

      /* ── Border radius ── */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
        DEFAULT: "var(--radius-md)",
      },

      /* ── Sombras ── */
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "accent-glow": "0 0 20px var(--color-accent-glow)",
      },

      /* ── Ancho sidebar ── */
      width: {
        sidebar: "var(--sidebar-width)",
      },

      /* ── Transiciones ── */
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },

      /* ── Backdrop blur ── */
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "32px",
      },

      /* ── Keyframes para microinteracciones ── */
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-up": "fade-in-up 250ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-left": "slide-in-left 200ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
