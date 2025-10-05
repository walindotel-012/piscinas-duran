/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-800': '#17365d',
        'blue-600': '#2563eb',
        'green-600': '#059669',
        'red-600': '#dc2626',
        'purple-500': '#9333ea',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}