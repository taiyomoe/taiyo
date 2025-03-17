"use client"

import { type CSSProperties, createContext, useContext, useState } from "react"
import type { ProviderProps } from "~/utils/types"

type SidebarContext = {
  state: "expanded" | "collapsed"
  setState: (state: "expanded" | "collapsed") => void
  // openMobile: boolean
  // setOpenMobile: (open: boolean) => void
  // isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContext | null>(null)

export const useSidebar = () => {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}

export const SidebarProvider = ({ children }: ProviderProps) => {
  const [state, setState] = useState<"expanded" | "collapsed">("expanded")

  const toggleSidebar = () => {
    setState((state) => (state === "expanded" ? "collapsed" : "expanded"))
  }

  return (
    <SidebarContext.Provider value={{ state, setState, toggleSidebar }}>
      <div
        className="flex min-h-dvh overflow-x-hidden"
        style={
          {
            "--sidebar-width": state === "expanded" ? "16rem" : "3rem",
          } as CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}
