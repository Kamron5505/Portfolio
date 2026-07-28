import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080C',
        surface: '#0F0F16',
        'surface-2': '#15151F',
        line: 'rgba(255,255,255,0.08)',
        ink: '#E7E8EE',
        muted: '#8A8F9A',
        faint: '#5A5F6B',
        accent: '#6366F1',
        'accent-2': '#22D3EE',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // Space Grotesk без кириллицы: русские заголовки подхватывает Inter
        // (--font-sans), а не случайный системный шрифт.
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1080px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'grid-pan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        blink: 'blink 1.1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
