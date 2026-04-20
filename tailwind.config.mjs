/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer-react/index.html",
    "./src/renderer-react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f9f9fb',
          foreground: '#111111',
        },
        border: 'rgba(0, 0, 0, 0.06)',
        ai: {
          bubble: '#ffffff',
          text: '#111111',
        },
        user: {
          bubble: '#000000',
          text: '#ffffff',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
