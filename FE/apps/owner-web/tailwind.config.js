import baseConfig from "../../shared/tailwind.config.base.js";

export default {
  presets: [baseConfig],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
};
