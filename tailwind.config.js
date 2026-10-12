/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0B0F19',
        panel: '#1F2937',
        accent: '#FF6500',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
}

