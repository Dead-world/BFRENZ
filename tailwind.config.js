/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00',
        background: '#000000',
        text: '#FFFFFF',
        accent: '#E65100',
      },
    },
  },
  plugins: [],
}
