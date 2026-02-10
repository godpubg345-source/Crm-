/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Outfit"', 'sans-serif'],
                serif: ['"Cormorant Garamond"', 'serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Map existing names to new variables for compatibility
                surface: {
                    dark: 'var(--background)',
                    card: 'var(--card)',
                    hover: 'var(--accent)',
                },
                primary: {
                    DEFAULT: "#AD03DE",
                    foreground: "#ffffff",
                },
                'bwbs-vibrant': '#AD03DE',
                // Update brand to use the new vibrant purple
                brand: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#AD03DE',
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                    950: '#3b0764',
                },
                accent: {
                    50: '#fbf8f3',
                    100: '#f5efe4',
                    200: '#ebdcc3',
                    300: '#dec29a',
                    400: '#cf9f66',
                    500: '#c27d3b', // Gold / Bronze
                    600: '#b0632e',
                    700: '#924d27',
                    800: '#793f24',
                    900: '#633520',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                zoomIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'zoom-in': 'zoomIn 0.3s ease-out',
            },
        },
    },
    plugins: [],
}
