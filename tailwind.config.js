// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'nice-gray': '#2e2e2e',  // make sure this is here
        'nice-white': '#ffffff'  // make sure this is here
      },
    },
  },
  plugins: [],
};
