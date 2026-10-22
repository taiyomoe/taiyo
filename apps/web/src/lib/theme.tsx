import * as stylex from "@stylexjs/stylex"
import { darkShadows, darkTheme } from "@taiyomoe/ui/styles/themes"
import { createContext, useState, useSyncExternalStore } from "react"

export type ThemePreference = "light" | "dark" | "system"

export const THEME_COOKIE = "theme"

const DARK_QUERY = "(prefers-color-scheme: dark)"

export const darkThemeClassName =
  `dark ${stylex.props(darkTheme, darkShadows).className ?? ""}`.trim()

export const systemThemeScript = `if(matchMedia(${JSON.stringify(DARK_QUERY)}).matches)document.documentElement.className=${JSON.stringify(darkThemeClassName)}`

const subscribeToSystemTheme = (onChange: () => void) => {
  const query = matchMedia(DARK_QUERY)

  query.addEventListener("change", onChange)

  return () => {
    query.removeEventListener("change", onChange)
  }
}

export function useThemeState(initial: ThemePreference) {
  const [preference, setPreferenceState] = useState(initial)
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => matchMedia(DARK_QUERY).matches,
    () => false,
  )

  return {
    dark: preference === "dark" || (preference === "system" && systemDark),
    preference,
    setPreference: (next: ThemePreference) => {
      const freeze = document.createElement("style")

      freeze.textContent = "*,*::before,*::after{transition:none!important}"
      document.head.append(freeze)
      setPreferenceState(next)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          freeze.remove()
        })
      })

      if (typeof cookieStore !== "undefined") {
        void cookieStore.set({
          expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
          name: THEME_COOKIE,
          path: "/",
          value: next,
        })
      }
    },
  }
}

export const ThemeContext = createContext<ReturnType<typeof useThemeState>>({
  dark: true,
  preference: "dark",
  setPreference: () => {},
})
