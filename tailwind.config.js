module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
          hover: 'hsl(var(--color-primary-hover))',
          active: 'hsl(var(--color-primary-active))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
          hover: 'hsl(var(--color-secondary-hover))',
          active: 'hsl(var(--color-secondary-active))',
        },
        tertiary: {
          DEFAULT: 'hsl(var(--color-tertiary))',
          foreground: 'hsl(var(--color-tertiary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
        },
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        border: 'hsl(var(--color-border))',
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          foreground: 'hsl(var(--color-success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          foreground: 'hsl(var(--color-warning-foreground))',
        },
        error: {
          DEFAULT: 'hsl(var(--color-error))',
          foreground: 'hsl(var(--color-error-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--color-info))',
          foreground: 'hsl(var(--color-info-foreground))',
        },
        gray: {
          50: 'hsl(0, 0%, 98%)',
          100: 'hsl(0, 0%, 95%)',
          200: 'hsl(0, 0%, 90%)',
          300: 'hsl(0, 0%, 80%)',
          400: 'hsl(0, 0%, 65%)',
          500: 'hsl(0, 0%, 50%)',
          600: 'hsl(0, 0%, 35%)',
          700: 'hsl(0, 0%, 25%)',
          800: 'hsl(0, 0%, 15%)',
          900: 'hsl(0, 0%, 10%)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
        brand: ['"Great Vibes"', 'cursive'],
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.2', fontWeight: '500' }],
        h2: ['24px', { lineHeight: '1.2', fontWeight: '500' }],
        h3: ['20px', { lineHeight: '1.2', fontWeight: '500' }],
        h4: ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px hsl(0, 0%, 0% / 0.05)',
        md: '0 2px 6px hsl(0, 0%, 0% / 0.1)',
        lg: '0 4px 12px hsl(0, 0%, 0% / 0.15)',
        xl: '0 8px 20px hsl(0, 0%, 0% / 0.2)',
        'button-primary': '0 2px 6px hsl(220, 85%, 35% / 0.3)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(280, 100%, 70%) 0%, hsl(290, 100%, 65%) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, hsl(220, 60%, 96%) 0%, hsl(220, 60%, 94%) 100%)',
        'gradient-accent': 'linear-gradient(135deg, hsl(280, 100%, 75%) 0%, hsl(290, 100%, 70%) 100%)',
      },
      letterSpacing: {
        tighter: '-0.025em',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
