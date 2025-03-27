"use client"

import {
  type CSSProperties,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react"
import { useMediaQuery } from "usehooks-ts"
import { siteConfig } from "~/site-config"
import type { ProviderProps } from "~/utils/types"

type SidebarContext = {
  state: "expanded" | "collapsed"
  openMobile: boolean
  isMobile: boolean
  setState: (state: "expanded" | "collapsed") => void
  setOpenMobile: (open: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContext | null>(null)

export const useSidebar = () => {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}

export const SidebarProvider = ({
  children,
  defaultOpen,
}: ProviderProps & { defaultOpen: boolean }) => {
  const cookieConfig = siteConfig.sidebar.cookie
  const isMobile = useMediaQuery("(max-width: 768px)", { defaultValue: false })
  const [openMobile, setOpenMobile] = useState(false)
  const [state, setState] = useState<"expanded" | "collapsed">(
    defaultOpen ? "expanded" : "collapsed",
  )

  const toggle = useCallback(() => {
    setState((prev) => {
      document.cookie = `${cookieConfig.name}=${prev === "expanded" ? "false" : "true"}; path=/; max-age=${cookieConfig.maxAge}`

      return prev === "expanded" ? "collapsed" : "expanded"
    })
  }, [cookieConfig.name, cookieConfig.maxAge])

  return (
    <SidebarContext.Provider
      value={{ state, openMobile, isMobile, setState, setOpenMobile, toggle }}
    >
      <div
        className="flex min-h-dvh"
        style={
          {
            "--sidebar-width": state === "expanded" ? "16rem" : "3rem",
            "--navbar-height": state === "expanded" ? "57px" : "49px",
          } as CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}
