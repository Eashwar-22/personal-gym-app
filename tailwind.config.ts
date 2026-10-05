import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18181B',
        panel: '#202024',
        line: '#2E2E33',
        accent: '#7490EA',
        muted: '#92929B',
        navy: '#1D2438',
        success: '#63C88D',
        danger: '#EA7F87'
      },
      borderRadius: { card: '22px' },
      fontFamily: { sans: ['Outfit', 'ui-sans-serif', 'system-ui'] },
      boxShadow: { none: 'none' }
    }
  },
  plugins: []
} satisfies Config
