/** Stomata Hour — cream / paper portfolio palette */
module.exports = {
  content: [
    "./docs/**/*.{html,js}",
    "./src/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        leaf: "#F7F3EA",
        "leaf-elev": "#FBF8F1",
        "leaf-panel": "rgba(255, 252, 245, 0.92)",
        stomata: {
          DEFAULT: "#0B8A8F",
          deep: "#0A6F73",
          bright: "#12A3A9",
          soft: "#3BB5BA",
        },
        guard: {
          DEFAULT: "#2F7A5C",
          edge: "#3D9470",
        },
        pore: {
          DEFAULT: "#3A4A42",
          open: "#2A3530",
        },
        drought: {
          DEFAULT: "#B86A3A",
          soft: "#C88458",
        },
        co2: {
          DEFAULT: "#4A7190",
          soft: "#6A8FA8",
        },
        light: {
          DEFAULT: "#B8942E",
          soft: "#C9A84A",
          blue: "#4A7EB8",
        },
        mist: {
          DEFAULT: "#5A6560",
          dim: "#7A8580",
        },
        ink: "#1A1F24",
        paper: {
          DEFAULT: "#F7F3EA",
          warm: "#F0E8D8",
          cool: "#F5F2EB",
          line: "rgba(26, 31, 36, 0.12)",
        },
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
