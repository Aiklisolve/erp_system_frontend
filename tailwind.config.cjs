/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens
        primary: {
          DEFAULT: '#0d9488',
          light: '#5eead4'
        },
        accent: {
          DEFAULT: '#fbbf24'
        },
        surface: {
          background: '#f8f9fc',
          card: '#ffffff'
        },
        text: {
          primary: '#111827',
          secondary: '#6b7280'
        },
        // Backwards-compatible aliases
        brand: {
          DEFAULT: '#0d9488',
          light: '#5eead4',
          dark: '#0f766e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 30px rgba(15, 118, 110, 0.15)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out'
      }
    }
  },
  plugins: []
};


