import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import type { StorybookConfig } from "@storybook/nextjs-vite"
import { mergeConfig } from "vite"

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const require = createRequire(import.meta.url)
const getAbsolutePath = (packageName: string): string =>
  dirname(require.resolve(join(packageName, "package.json")))

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
  viteFinal: async (config) =>
    mergeConfig(config, {
      build: { commonjsOptions: { transformMixedEsModules: true } },
    }),
} satisfies StorybookConfig
