/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Include all pages
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Include all components
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Include app directory (if using App Router)
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Include src directory (if you're using src folder structure)
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    
    // Include any other directories with components
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Your theme extensions go here
    },
  },
  plugins: [
    // Your plugins go here
  ],
}