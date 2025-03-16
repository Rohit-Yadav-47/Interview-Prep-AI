/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#1E1E1E',
          200: '#2D2D2D',
          300: '#3D3D3D',
          400: '#4D4D4D',
          500: '#5D5D5D',
          600: '#6D6D6D',
          700: '#7D7D7D',
          800: '#8D8D8D',
          900: '#9D9D9D',
        },
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          red: '#EF4444',
          yellow: '#F59E0B',
          purple: '#8B5CF6',
          indigo: '#6366F1',
        }
      },
      boxShadow: {
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
