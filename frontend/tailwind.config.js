/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'street-green': '#00FF41',
        'neon-green': '#39FF14',
        'dark-green': '#003B00',
        'forest-green': '#00A86B',
        'cyber-green': '#0FFF50',
        'street-black': '#000000',
        'street-dark': '#0A0A0A',
        'street-card': '#111111',
        'street-gray': '#1A1A1A',
      },
      fontFamily: {
        'street': ['"Bebas Neue"', '"Impact"', 'cursive'],
        'urban': ['"Urbanist"', 'sans-serif'],
        'mono': ['"Share Tech Mono"', 'monospace'],
        'grunge': ['"Poppins"', 'sans-serif'],
        'onyx': ['"Onyx"', '"Bebas Neue"', 'cursive'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'pulse-green': 'pulse-green 1.5s ease-in-out infinite',
        'border-pulse': 'border-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-green': {
          '0%, 100%': { textShadow: '0 0 10px #00FF41, 0 0 20px #00FF41' },
          '50%': { textShadow: '0 0 20px #39FF14, 0 0 40px #39FF14' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'border-pulse': {
          '0%, 100%': { borderColor: 'rgba(0, 255, 65, 0.3)' },
          '50%': { borderColor: 'rgba(0, 255, 65, 1)' },
        },
      }
    },
  },
  plugins: [],
}