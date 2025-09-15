import { withThemeByClassName } from "@storybook/addon-themes"
import type { Preview } from "@storybook/nextjs-vite"
import "../../../packages/ui/src/styles/globals.css"

export default {
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
} satisfies Preview

export const decorators = [
  withThemeByClassName({
    themes: { light: "light bg-default", dark: "dark bg-default" },
    defaultTheme: "light",
  }),
]
