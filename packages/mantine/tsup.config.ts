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
    "@formosaic/core",
    "@mantine/core",
    "@mantine/dates",
    "dayjs",
  ],
  jsx: "automatic",
});
