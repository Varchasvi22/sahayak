/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Civic-Tech Brand Identity
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        civic: {
          navy: '#0f172a',
          blue: '#1d4ed8',
          saffron: '#d97706',
          emerald: '#059669',
        },
        // Tri-State Status Colors (High Contrast)
        status: {
          eligible: '#059669',       // Green
          notEligible: '#dc2626',    // Red
          unknown: '#d97706',        // Amber
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
