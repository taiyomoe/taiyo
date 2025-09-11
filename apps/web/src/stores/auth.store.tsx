"use client"

import type { Session, User } from "@taiyomoe/auth/server"
import { config } from "@taiyomoe/config"
import { omit } from "radash"
import { type ReactNode, createContext, useContext, useRef } from "react"
import { createStore, useStore } from "zustand"

type State = {
  user: Omit<User, "settings"> | null
  session: Session["session"] | null
  settings: Required<PrismaJson.UserSettings>

  updateSettings: (newSettings: PrismaJson.UserSettings) => void
  signOut: () => void
}

type AuthStore = ReturnType<typeof createAuthStore>

const createAuthStore = (
  session: Session | null,
  settings: PrismaJson.UserSettings,
) =>
  createStore<State>((set) => ({
    user: session ? omit(session.user, ["settings"]) : null,
    session: session?.session ?? null,
    settings: {
      ...config.settings,
      ...settings,
      ...session?.user.settings,
    },

    updateSettings: (newSettings: PrismaJson.UserSettings) => {
      set((prev) => ({ settings: { ...prev.settings, ...newSettings } }))
    },
    signOut: () => {
      set({ user: null, session: null })
    },
  }))

/**
 * React part.
 */
const AuthContext = createContext<AuthStore | null>(null)

export const AuthStoreProvider = ({
  children,
  session,
  settings,
}: {
  children: ReactNode
  session: Session | null
  settings: PrismaJson.UserSettings
}) => {
  const storeRef = useRef<AuthStore>(null)

  if (!storeRef.current) {
    storeRef.current = createAuthStore(session, settings)
  }

  return (
    <AuthContext.Provider value={storeRef.current}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const store = useContext(AuthContext)

  if (!store) {
    throw new Error("useAuth must be used within a AuthContext")
  }

  return useStore(store, (state) => state)
}

export const useUser = () => {
  const store = useContext(AuthContext)

  if (!store) {
    throw new Error("useUser must be used within a AuthContext")
  }

  return useStore(store, (state) => state.user)
}

export const useSession = () => {
  const store = useContext(AuthContext)

  if (!store) {
    throw new Error("useSession must be used within a AuthContext")
  }

  return useStore(store, (state) => state.session)
}

export const useSettings = () => {
  const store = useContext(AuthContext)

  if (!store) {
    throw new Error("useSettings must be used within a AuthContext")
  }

  return useStore(store, (state) => state.settings)
}
