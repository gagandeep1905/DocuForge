import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#17152a',
        violet: {
          50: '#f5f2ff',
          100: '#ece6ff',
          500: '#7457e8',
          600: '#6044d2',
          700: '#4c35b2',
        },
      },
      boxShadow: {
        lift: '0 20px 60px rgba(35, 24, 86, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
