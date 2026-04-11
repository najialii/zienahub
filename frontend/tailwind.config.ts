import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome - Black, White, Gray only
        primary: {
          DEFAULT: '#050505', // Pure black
          light: '#050505',
          dark: '#050505',
        },
        secondary: {
          DEFAULT: '#FAFAFA', // Light gray
          light: '#FFFFFF',
          dark: '#F5F5F5',
        },
        accent: {
          DEFAULT: '#404040', // Medium gray
          light: '#525252',
          dark: '#262626',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        success: '#000000',
        error: '#000000',
        warning: '#525252',
        info: '#000000',
        background: '#FFFFFF',
        foreground: '#000000',
      },
      fontFamily: {
        sans: ['El Messiri', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['El Messiri', 'system-ui', '-apple-system', 'sans-serif'],
        poppins: ['El Messiri', 'system-ui', '-apple-system', 'sans-serif'],
        'el-messiri': ['El Messiri', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
    // Override default border radius to 0 for sharp corners
    borderRadius: {
      'none': '0',
      DEFAULT: '0',
    },
  },
  plugins: [],
};
export default config;
