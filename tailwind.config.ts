// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink:  "#0b1d34",  // fond sombre
          navy: "#0e2442",  // bleu principal (logo)
          sky:  "#5bc4ff",  // bleu clair (le “is” du logo / accents)
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
