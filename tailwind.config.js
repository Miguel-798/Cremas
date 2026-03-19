/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6ED',
          200: '#F5EED9',
          300: '#EFE3BC',
          400: '#E7D496',
          500: '#DFC273',
          600: '#D4A84A',
          700: '#B8893D',
          800: '#956D34',
          900: '#77572C',
        },
        peach: {
          50: '#FFF5F0',
          100: '#FFE8DB',
          200: '#FFD4BC',
          300: '#FFB899',
          400: '#FF9B76',
          500: '#FF7D53',
          600: '#FF5E30',
          700: '#E5461D',
          800: '#BD3819',
          900: '#962D16',
        },
        espresso: {
          50: '#F5F0EB',
          100: '#E8DFD5',
          200: '#D4C4B0',
          300: '#BFA387',
          400: '#AB8563',
          500: '#9C6B49',
          600: '#85573D',
          700: '#6D4634',
          800: '#5A3A2D',
          900: '#4C3127',
        },
        matcha: {
          50: '#F5F8F0',
          100: '#E9F0DE',
          200: '#D4E2BF',
          300: '#B8CE97',
          400: '#9ABA72',
          500: '#7FA555',
          600: '#668743',
          700: '#536C38',
          800: '#445730',
          900: '#39472B',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
