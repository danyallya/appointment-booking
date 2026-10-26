import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}"], theme: { extend: { colors: { paper: "#f7f2ec", ink: "#29242a" } } }, plugins: [] };
export default config;