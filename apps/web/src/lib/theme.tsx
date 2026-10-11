import * as stylex from "@stylexjs/stylex"
import { darkShadows, darkTheme } from "@taiyomoe/ui/styles/themes"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"
import { createContext, use, useCallback, useState, useSyncExternalStore } from "react"

export type ThemePreference = "light" | "dark" | "system"

const THEME_COOKIE = "theme"
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365
const DARK_QUERY = "(prefers-color-scheme: dark)"

export const darkThemeClassName =
  `dark ${stylex.props(darkTheme, darkShadows).className ?? ""}`.trim()

export const systemThemeScript = `if(matchMedia(${JSON.stringify(DARK_QUERY)}).matches)document.documentElement.className=${JSON.stringify(darkThemeClassName)}`

const parseThemeCookie = (cookieHeader: string): ThemePreference => {
  const value = cookieHeader
    .split(";")
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(`${THEME_COOKIE}=`))
    ?.slice(THEME_COOKIE.length + 1)

  return value === "light" || value === "system" ? value : "dark"
}

export const getThemePreference = createIsomorphicFn()
  .server(() => parseThemeCookie(getRequestHeader("cookie") ?? ""))
  .client(() => parseThemeCookie(document.cookie))

const subscribeToSystemTheme = (onChange: () => void) => {
  const query = matchMedia(DARK_QUERY)

  query.addEventListener("change", onChange)

  return () => query.removeEventListener("change", onChange)
}
const freezeTransitions = () => {
  const style = document.createElement("style")

  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.append(style)

  return () => {
    getComputedStyle(document.body)
    requestAnimationFrame(() => style.remove())
  }
}

export type ThemeState = {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  dark: boolean
}

export function useThemeState(initial: ThemePreference): ThemeState {
  const [preference, setPreferenceState] = useState(initial)
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => matchMedia(DARK_QUERY).matches,
    () => false,
  )
  const setPreference = useCallback((next: ThemePreference) => {
    const unfreeze = freezeTransitions()

    setPreferenceState(next)
    requestAnimationFrame(unfreeze)

    if (typeof cookieStore !== "undefined") {
      void cookieStore.set({
        expires: Date.now() + COOKIE_MAX_AGE_MS,
        name: THEME_COOKIE,
        path: "/",
        value: next,
      })
    }
  }, [])

  return {
    dark: preference === "dark" || (preference === "system" && systemDark),
    preference,
    setPreference,
  }
}

export const ThemeContext = createContext<ThemeState | null>(null)

export function useTheme(): ThemeState {
  const theme = use(ThemeContext)

  if (!theme) {
    throw new Error("useTheme must be used within ThemeContext.")
  }

  return theme
}
