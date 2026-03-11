import type { StorybookConfig } from "@storybook/react-vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname_ = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-links",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@formosaic/core": resolve(
            __dirname_,
            "../packages/core/src"
          ),
          "@formosaic/fluent": resolve(
            __dirname_,
            "../packages/fluent/src"
          ),
          "@formosaic/radix": resolve(
            __dirname_,
            "../packages/radix/src"
          ),
          "@formosaic/react-aria": resolve(
            __dirname_,
            "../packages/react-aria/src"
          ),
        },
      },
    };
  },
};

export default config;
