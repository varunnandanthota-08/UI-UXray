/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFCC33',
          'yellow-light': '#FFF8E5',
          'yellow-hover': '#F5BF22',
          blue: '#344499',
          'blue-light': '#EEF1FB',
          'blue-dark': '#263378',
          bg: '#FFFDF7',
          surface: '#FFFFFF',
          'text-primary': '#171A2B',
          'text-secondary': '#5F6475',
          border: '#E7E7E2',
          'border-light': '#F0F0EB',
          success: '#2E7D32',
          'success-bg': '#E8F5E9',
          warning: '#C88700',
          'warning-bg': '#FFF8E1',
          error: '#C62828',
          'error-bg': '#FFEBEE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(23, 26, 43, 0.04)',
        'card': '0 4px 20px rgba(23, 26, 43, 0.06)',
        'card-hover': '0 8px 30px rgba(23, 26, 43, 0.10)',
      }
    },
  },
  plugins: [],
}
