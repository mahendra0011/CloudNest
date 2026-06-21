/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        gd: {
          blue: '#4285F4',
          'blue-dark': '#1a73e8',
          green: '#34A853',
          'green-dark': '#188038',
          yellow: '#FBBC04',
          'yellow-dark': '#F9AB00',
          red: '#EA4335',
        },
      },
      boxShadow: {
        panel: '0 14px 40px rgba(15, 23, 42, 0.08)',
        'gd-blue': '0 8px 32px rgba(66, 133, 244, 0.25)',
        'gd-green': '0 8px 32px rgba(52, 168, 83, 0.25)',
        'gd-yellow': '0 8px 32px rgba(251, 188, 4, 0.25)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
