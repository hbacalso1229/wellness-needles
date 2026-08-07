/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const typography = require('@tailwindcss/typography');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d5016',
        secondary: '#4a7c2a',
        accent: '#7fb069',
        'light-green': '#a7c957',
        cream: '#ffffff',
        earth: '#8b4513',
        gold: '#d4af37',
        'text-dark': '#2a2a28',
        'text-light': '#7f8c8d',
        // Logo blues - minor accent colors
        'blue-primary': '#00A2E8',
        'blue-light': '#84C0DC',
        'blue-subtle': '#E6F7FF', // Very light blue for backgrounds
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif-heading)'],
      },
      backgroundImage: {
        'jungle-gradient': 'linear-gradient(135deg, #2d5016 0%, #4a7c2a 50%, #7fb069 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #d4af37 0%, #7fb069 100%)',
        'ocean-accent': 'linear-gradient(135deg, #84C0DC 0%, #00A2E8 100%)',
        'harmony-gradient': 'linear-gradient(135deg, #7fb069 0%, #84C0DC 50%, #00A2E8 100%)',
      },
    },
  },
  plugins: [
    typography,
  ],
}

