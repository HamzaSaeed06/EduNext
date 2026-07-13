/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-base': '#F6F7F3',
        'bg-surface': '#FFFFFF',
        'bg-surface-alt': '#EDEFE8',
        'ink-primary': '#182620',
        'ink-muted': '#5A6B60',
        'border-color': '#DADFD3',
        'trail-green': '#2F6F4E',
        'trail-amber': '#E2A03E',
        'signal-blue': '#3556D9',
        'error-clay': '#B5482F',
        'bg-base-dark': '#141B16',
        'bg-surface-dark': '#1C251F',
        'ink-primary-dark': '#EAEFE7',
        'trail-green-dark': '#4FA173',
        'trail-amber-dark': '#F0B65C',
        'signal-blue-dark': '#6C87F0',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05' }],
        'display-l': ['2.25rem', { lineHeight: '1.1' }],
        'display-s': ['1.75rem', { lineHeight: '1.15' }],
        heading: ['1.5rem', { lineHeight: '1.3' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        micro: ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(24,38,32,0.06)',
        'card-hover': '0 4px 16px rgba(24,38,32,0.12)',
      },
    },
  },
  plugins: [],
}
