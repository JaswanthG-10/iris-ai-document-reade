/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0D11",       // Genuinely dark near-black canvas
        darkPanel: "#131720",    // Layered glass panels background
        brandCyan: "#00E5FF",    // Deep cyan accent
        brandIndigo: "#6366F1",  // Electric indigo active tracer
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'scan': 'scan 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.4))' },
        }
      }
    },
  },
  plugins: [],
}
