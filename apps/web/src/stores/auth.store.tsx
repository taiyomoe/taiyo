"use client"

import type { Session, User } from "@taiyomoe/auth/server"
import { omit } from "radash"
import { type ReactNode, createContext, useContext, useRef } from "react"
import { createStore, useStore } from "zustand"

type State = {
  user: Omit<User, "settings"> | null
  session: Session["session"] | null
  settings: PrismaJson.UserSettings

  signOut: () => void
}

type AuthStore = ReturnType<typeof createAuthStore>

const createAuthStore = (initProps: Session | null) =>
  createStore<State>((set) => ({
    user: initProps ? omit(initProps.user, ["settings"]) : null,
    session: initProps?.session ?? null,
    settings: {
      contentRating: ["NORMAL", "SUGGESTIVE", "NSFW", "NSFL"],
      preferredTitles: "en",
      showFollowing: true,
      showLibrary: true,
      homeLayout: "ROWS",
      ...initProps?.user.settings,
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
  value,
}: { children: ReactNode; value: Session | null }) => {
  const storeRef = useRef<AuthStore>(null)

  if (!storeRef.current) {
    storeRef.current = createAuthStore(value)
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
