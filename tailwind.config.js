/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#0a0e17',
          surface: '#111827',
          surface2: '#1a2234',
          card: '#161f30',
          border: '#243048',
          borderLight: '#334155',
          text: '#f8fafc',
          muted: '#94a3b8',
          subtle: '#64748b',
          profit: '#10b981',
          profitBg: 'rgba(16, 185, 129, 0.12)',
          profitBorder: 'rgba(16, 185, 129, 0.25)',
          loss: '#ef4444',
          lossBg: 'rgba(239, 68, 68, 0.12)',
          lossBorder: 'rgba(239, 68, 68, 0.25)',
          gold: '#f59e0b',
          goldBg: 'rgba(245, 158, 11, 0.12)',
          indigo: '#6366f1',
          indigoBg: 'rgba(99, 102, 241, 0.12)',
          cyan: '#06b6d4',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'glow-profit': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-loss': '0 0 20px -5px rgba(239, 68, 68, 0.3)',
        'glow-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
      }
    },
  },
  plugins: [],
}
