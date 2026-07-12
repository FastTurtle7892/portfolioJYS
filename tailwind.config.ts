import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundColor: {
        dark: "rgb(6, 20, 41)",
        light: "#ffffff",
        sand: "#F3F5F7",
      },
      colors: {
        /* 임베디드/딥테크 톤의 블루-네이비 팔레트 */
        blue: "#1D6FE0",
        green: "#123A73",
        lime: "#04213F",
        sand: "#F1F6FF",
        black: "#1F1F1F",
        primary: "rgba(var(--color-primary), <alpha-value>)",
        secondary: "rgba(var(--color-secondary), <alpha-value>)",
        point: "rgba(var(--color-point), <alpha-value>)",
        foreground: "rgba(var(--foreground-rgb), <alpha-value>)",
        background: "rgba(var(--background-rgb), <alpha-value>)",
      },
      zIndex: {
        "modal-overlay": "899",
        "modal-content": "900",
      },
    },
  },
  plugins: [],
};
export default config;
