import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A1A40", // bleu nuit
        accent: "#3DBEFF",  // bleu clair
      },
      borderRadius: {
        xl: "24px",
      },
    },
  },
  plugins: [],
}
export default config
