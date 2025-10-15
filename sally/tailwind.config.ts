import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        success: "var(--color-success)",
        automation: "var(--color-automation)",
      },
      fontFamily: {
        'inter': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'], // Default to Inter
        'geist-sans': ['var(--font-geist-sans)', 'system-ui', 'sans-serif'], // Keep Geist available
        'mono': ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
