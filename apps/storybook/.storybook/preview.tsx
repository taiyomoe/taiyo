import addonDocs from "@storybook/addon-docs"
import { withThemeByClassName } from "@storybook/addon-themes"
import { definePreview } from "@storybook/react-vite"
import * as stylex from "@stylexjs/stylex"
import { darkShadows, darkTheme } from "@taiyomoe/ui/styles/themes"
import { useEffect } from "react"
import "@taiyomoe/ui/style.css"

const darkClassNames = (stylex.props(darkTheme, darkShadows).className ?? "")
  .split(" ")
  .filter(Boolean)
const styles = stylex.create({
  canvas: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    isolation: "isolate",
    justifyContent: "center",
    position: "relative",
    height: "100%",
  },
})

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
        <div {...stylex.props(styles.canvas)}>
          <Story />
        </div>
      )
    },
  ],
})
