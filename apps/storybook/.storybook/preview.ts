import addonDocs from "@storybook/addon-docs"
import { withThemeByClassName } from "@storybook/addon-themes"
import { definePreview } from "@storybook/react-vite"
import "@taiyomoe/ui/globals.css"

export default definePreview({
  addons: [addonDocs()],
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "light bg-default", dark: "dark bg-default" },
      defaultTheme: "light",
    }),
  ],
})
