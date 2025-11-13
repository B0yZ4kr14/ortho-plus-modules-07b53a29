import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        shadow: {
          sm: "var(--shadow-sm)",
          md: "var(--shadow-md)",
          lg: "var(--shadow-lg)",
          xl: "var(--shadow-xl)",
        },
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        module: {
          blue: "hsl(var(--module-blue))",
          purple: "hsl(var(--module-purple))",
          yellow: "hsl(var(--module-yellow))",
          orange: "hsl(var(--module-orange))",
          cyan: "hsl(var(--module-cyan))",
          pink: "hsl(var(--module-pink))",
          green: "hsl(var(--module-green))",
          red: "hsl(var(--module-red))",
        },
        stat: {
          "blue-bg": "hsl(var(--stat-blue-bg))",
          "purple-bg": "hsl(var(--stat-purple-bg))",
          "green-bg": "hsl(var(--stat-green-bg))",
          "orange-bg": "hsl(var(--stat-orange-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "collapsible-down": {
          from: { 
            height: "0",
            opacity: "0"
          },
          to: { 
            height: "var(--radix-collapsible-content-height)",
            opacity: "1"
          },
        },
        "collapsible-up": {
          from: { 
            height: "var(--radix-collapsible-content-height)",
            opacity: "1"
          },
          to: { 
            height: "0",
            opacity: "0"
          },
        },
        "fade-in": {
          from: { 
            opacity: "0",
            transform: "translateY(20px) scale(0.95)"
          },
          to: { 
            opacity: "1",
            transform: "translateY(0) scale(1)"
          },
        },
        "slide-in": {
          from: { 
            transform: "translateX(-10px)",
            opacity: "0"
          },
          to: { 
            transform: "translateX(0)",
            opacity: "1"
          },
        },
        "glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(45, 212, 191, 0.3)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(45, 212, 191, 0.5)" 
          }
        },
        "shimmer": {
          "0%": { 
            backgroundPosition: "-200% 0" 
          },
          "100%": { 
            backgroundPosition: "200% 0" 
          }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(4)", opacity: "0" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.3s ease-out",
        "collapsible-up": "collapsible-up 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "shake": "shake 0.5s ease-in-out",
        "ripple": "ripple 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
