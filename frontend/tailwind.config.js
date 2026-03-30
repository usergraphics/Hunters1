/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'oklch(0.38 0.12 155)',
          foreground: 'oklch(0.98 0.01 155)',
        },
        background: 'oklch(0.99 0.005 155)',
        foreground: 'oklch(0.15 0.02 155)',
        status: {
          available: 'bg-emerald-50 text-emerald-700',
          occupied: 'bg-gray-50 text-gray-600',
          maintenance: 'bg-amber-50 text-amber-700',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
