/** Stomata Hour — leaf / guard-cell palette */
module.exports = {
  content: [
    "./docs/**/*.{html,js}",
    "./src/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        leaf: "#0a1410",
        "leaf-elev": "#102018",
        "leaf-panel": "rgba(10, 28, 20, 0.86)",
        stomata: {
          DEFAULT: "#1f6b45",
          deep: "#134830",
          bright: "#2f9a62",
          soft: "#4bb87a",
        },
        guard: {
          DEFAULT: "#2a5c40",
          edge: "#3d7a56",
        },
        pore: {
          DEFAULT: "#0c1a14",
          open: "#06100c",
        },
        drought: {
          DEFAULT: "#c4784a",
          soft: "#a05a32",
        },
        co2: {
          DEFAULT: "#6b8fad",
          soft: "#4a6d88",
        },
        light: {
          DEFAULT: "#e8c84a",
          soft: "#c4a63a",
          blue: "#6b9fd7",
        },
        mist: {
          DEFAULT: "#9ab5a8",
          dim: "#5a7468",
        },
        ink: "#e6f0ea",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
        hub: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.28em",
        wide2: "0.16em",
      },
      animation: {
        breathe: "breathe 3.2s ease-in-out infinite",
        "panel-in": "panel-in 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)",
        "fade-up": "fade-up 0.45s cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        "panel-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      transitionTimingFunction: {
        stomata: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
