import addonDocs from "@storybook/addon-docs"
import { withThemeByClassName } from "@storybook/addon-themes"
import { definePreview } from "@storybook/react-vite"
import "@taiyomoe/ui/style.css"

export default definePreview({
  addons: [addonDocs()],
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
    }),
    (Story) => (
      <div className="relative isolate flex h-full flex-col items-center justify-center">
        <Story />
      </div>
    ),
  ],
})
