/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'indeterminate': 'indeterminate 1.5s infinite ease-in-out',
        'stripes': 'stripes 1s linear infinite',
      },
      keyframes: {
        'indeterminate': {
          '0%': { transform: 'translateX(-100%) scaleX(0.3)' },
          '50%': { transform: 'translateX(50%) scaleX(0.8)' },
          '100%': { transform: 'translateX(200%) scaleX(0.3)' },
        },
        'stripes': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '1rem 0' },
        },
      },
    },
  },
  plugins: [],
};