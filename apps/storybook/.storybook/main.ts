import path from "node:path"
import type { StorybookConfig } from "@storybook/nextjs-vite"

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const _require = typeof require === "undefined" ? import.meta : require
const getAbsolutePath = (packageName: string): string =>
  path
    .dirname(_require.resolve(path.join(packageName, "package.json")))
    .replace(/^file:\/\//, "")

export default {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {},
  },
  docs: {
    defaultName: "Overview",
  },
} satisfies StorybookConfig
