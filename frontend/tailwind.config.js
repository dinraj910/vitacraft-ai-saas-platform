/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#f0bc6e', 400: '#e99a35', 500: '#e07d15',
          600: '#c56010', 700: '#a44410',
        },
        dark: {
          600: '#526180', 700: '#434f68', 800: '#3a4458',
          900: '#343c4c', 950: '#0f1117',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                                   '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
};