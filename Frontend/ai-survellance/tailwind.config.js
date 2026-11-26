/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#FFFFFF",
        surface: "#F5F7FA",
        surfaceHover: "#EDF1F7",
        card: "#FFFFFF",
        primary: "#252B36",
        secondary: "#697586",
        tertiary: "#9AA5B5",
        subtle: "#E5E9F0",
        border: "#E5E9F0",
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
          DEFAULT: "#2563EB",
        },
        success: {
          light: "#E8F7F0",
          DEFAULT: "#16A36A",
          dark: "#0F764E"
        },
        warning: {
          light: "#FEF7ED",
          DEFAULT: "#E59A23",
          dark: "#B47214"
        },
        critical: {
          light: "#FDF2F2",
          DEFAULT: "#DC4545",
          dark: "#B82E2E"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        card: "0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)",
        dropdown: "0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
        modal: "0 20px 25px -5px rgba(16, 24, 40, 0.08), 0 8px 10px -6px rgba(16, 24, 40, 0.04)"
      }
    },
  },
  plugins: [],
}
