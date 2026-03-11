import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "@form-eng/core",
    "baseui",
    "styletron-engine-monolithic",
    "styletron-react",
  ],
  jsx: "automatic",
});
