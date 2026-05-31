import { defineMain } from "@storybook/react-vite/node"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * This function is used to resolve the absolute path of a package.
 *
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const getAbsolutePath = (value: string) =>
  dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))

export default defineMain({
  framework: getAbsolutePath("@storybook/react-vite"),
  stories: ["../src/stories/*.mdx", "../src/stories/*.stories.tsx"],
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  docs: {
    defaultName: "Overview",
  },
})
