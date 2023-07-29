/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src_web/**/*.{html,js,ts,jsx,tsx}', './public/index.html'],
    theme: {
        extend: {},
    },
    plugins: [require('tailwind-scrollbar')],
}
