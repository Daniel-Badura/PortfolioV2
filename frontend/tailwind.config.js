/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  screens: {
    sm: "480px",
    md: "768px",
    lg: "976px",
    xl: "1440px",
  },
  extend: {
    fontFamily: {
      chakra: ["Chakra Petch"],
      sourceCode: ["Source Code Pro"],
    },
    letterSpacing: {
      em3: ".3em",
    },
  },
};
export const plugins = [];
