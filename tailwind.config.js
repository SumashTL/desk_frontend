import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  safelist: ['dark'],
  prefix: '',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './app/**/*.{js,vue,ts}',
    './error.vue',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        brand: 'var(--primary-green, #17900D)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // 1. Dashboard & Surface Backgrounds
        'dashboard-bg': 'var(--dashboard-bg, #F3F4F7)',
        'sidebar-bg': 'var(--sidebar-bg, #FFFFFF)',
        'card-surface': 'var(--card-surface, #FEFEFE)',
        'search-bg': 'var(--search-bg, #F1F3F6)',
        'subtle-bg': 'var(--subtle-bg, #F9FAFB)',

        // 2. Green Accent Colors
        'primary-green': 'var(--primary-green, #17900D)',
        'dark-green': 'var(--dark-green, #005700)',
        'logo-green': 'var(--logo-bg-green, #007300)',
        'light-green-border': 'var(--light-green-border, #79BB7A)',
        'active-nav-bg': 'var(--active-nav-bg, #EAF8E6)',
        'stat-icon-bg': 'var(--stat-icon-bg, #ECF9E9)',
        'available-card-bg': 'var(--available-card-bg, #EAF8E6)',
        'badge-bg': 'var(--badge-bg, #EAF8E6)',
        'avatar-bg': 'var(--active-nav-bg, #EAF8E6)',

        primary: {
          DEFAULT: 'var(--primary-green, #17900D)',
          dark: 'var(--dark-green, #005700)',
          logo: 'var(--logo-bg-green, #007300)',
          border: 'var(--light-green-border, #79BB7A)',
          active: 'var(--active-nav-bg, #EAF8E6)',
          light: 'var(--active-nav-bg, #EAF8E6)',
          stat: 'var(--stat-icon-bg, #ECF9E9)',
          icon: 'var(--stat-icon-bg, #ECF9E9)',
          available: 'var(--available-card-bg, #EAF8E6)',
          chart: 'var(--dark-green, #005700)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        green: {
          DEFAULT: 'var(--primary-green, #17900D)',
          primary: 'var(--primary-green, #17900D)',
          dark: 'var(--dark-green, #005700)',
          logo: 'var(--logo-bg-green, #007300)',
          border: 'var(--light-green-border, #79BB7A)',
          active: 'var(--active-nav-bg, #EAF8E6)',
          light: 'var(--active-nav-bg, #EAF8E6)',
          stat: 'var(--stat-icon-bg, #ECF9E9)',
          icon: 'var(--stat-icon-bg, #ECF9E9)',
          available: 'var(--available-card-bg, #EAF8E6)',
          chart: 'var(--dark-green, #005700)',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          surface: 'var(--card-surface, #FEFEFE)',
          foreground: 'hsl(var(--card-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          bg: 'var(--subtle-bg, #F9FAFB)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
          bg: 'var(--search-bg, #F1F3F6)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'collapsible-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-in-out',
        'collapsible-up': 'collapsible-up 0.2s ease-in-out',
      },
    },
  },
  plugins: [animate],
}
