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
        civic: {
          navy: '#0b1d33',       // Primary authoritative dark blue
          dark: '#06101d',       // Deepest contrast text / bar
          emerald: '#0d5c46',    // Trustworthy green
          lightEmerald: '#ebfbf5',
          saffron: '#c2410c',    // Restrained Indian amber/saffron accent
          sand: '#fbfaf8',       // Warm off-white background
          card: '#ffffff',
          border: '#e7e5e0',     // Subtle warm border
          subtle: '#64748b',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#16a34a',
          600: '#0d5c46',
          700: '#0a4937',
          800: '#063427',
          900: '#032018',
        },
        // Tri-State Status Colors (High Contrast, Accessible)
        status: {
          eligible: '#047857',       // Emerald 700
          eligibleBg: '#ecfdf5',     // Emerald 50
          eligibleBorder: '#a7f3d0', // Emerald 200

          notEligible: '#b91c1c',    // Red 700
          notEligibleBg: '#fef2f2',  // Red 50
          notEligibleBorder: '#fecaca', // Red 200

          unknown: '#b45309',        // Amber 700
          unknownBg: '#fffbeb',      // Amber 50
          unknownBorder: '#fde68a',  // Amber 200
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
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
