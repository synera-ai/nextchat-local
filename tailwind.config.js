/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Integrate with existing design system
      colors: {
        // Use existing color variables from design system
        primary: 'var(--primary)',
        secondary: 'var(--second)',
        background: 'var(--theme-color)',
        foreground: 'var(--black)',
        border: 'var(--border-in-light)',
      },
      fontFamily: {
        sans: [
          'Noto Sans',
          'SF Pro SC',
          'SF Pro Text',
          'SF Pro Icons',
          'PingFang SC',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
  // Ensure compatibility with existing SCSS
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to avoid conflicts
  },
}
