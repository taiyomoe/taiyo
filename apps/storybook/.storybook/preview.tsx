import addonDocs from "@storybook/addon-docs"
import { withThemeByClassName } from "@storybook/addon-themes"
import { definePreview } from "@storybook/react-vite"
import * as stylex from "@stylexjs/stylex"
import { darkShadows, darkTheme } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect } from "react"
import "@taiyomoe/ui/style.css"

// StyleX themes are classes that re-declare the token variables. They go on
// <html> (like the addon's `dark` class) so components rendered in portals
// inherit the dark tokens too.
const darkClassNames = (stylex.props(darkTheme, darkShadows).className ?? "")
  .split(" ")
  .filter(Boolean)

export default definePreview({
  addons: [addonDocs()],
  initialGlobals: { theme: "light" },
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
    }),
    (Story, context) => {
      const isDark = context.globals.theme === "dark"

      useEffect(() => {
        const root = document.documentElement

        if (isDark) {
          root.classList.add(...darkClassNames)
        } else {
          root.classList.remove(...darkClassNames)
        }
      }, [isDark])

      return (
        <div className="relative isolate flex h-full flex-col items-center justify-center">
          <Story />
        </div>
      )
    },
  ],
})
