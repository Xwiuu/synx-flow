// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Nosso Verde Natureza Tech
                synx: {
                    DEFAULT: "#10b981", // Emerald-500 (Equilíbrio perfeito)
                    hover: "#059669",   // Emerald-600 (Para hovers)
                    glow: "rgba(16, 185, 129, 0.5)", // Para efeitos de luz
                },
                // Dark Mode Profundo (Glass Base)
                glass: {
                    base: "rgba(255, 255, 255, 0.03)",
                    border: "rgba(255, 255, 255, 0.08)",
                }
            },
        },
    },
    plugins: [],
};
export default config;