"use client"

import { tv } from "tailwind-variants"
import { SidebarIcon } from "~/components/icons/SidebarIcon"
import { useReaderSettingsStore } from "~/stores"

const readerSidebarOpenOverlay = tv({
  slots: {
    container: "fixed top-20 z-[15]",
    button:
      "group flex select-none flex-col items-center p-8 text-neutral-300 opacity-0 transition-all hover:cursor-pointer hover:opacity-100",
    accent: "group-hover:shadow-intense",
    text: "text-large mb-2 font-medium",
  },
  variants: {
    hide: {
      true: {
        button: "hidden",
      },
    },
    side: {
      left: {
        container: "left-0",
      },
      right: {
        container: "right-4",
      },
    },
  },
})

export const ReaderSidebarOpenOverlay = () => {
  const { sidebar, update } = useReaderSettingsStore()

  const { container, button, accent, text } = readerSidebarOpenOverlay({
    hide: sidebar.state === "show",
    side: sidebar.side,
  })

  if (sidebar.openMode === "button") {
    return null
  }

  return (
    <div className={container()}>
      <button
        className={button()}
        onClick={() => update("sidebar.state", "show")}
        type="button"
      >
        <span className={accent()} />
        <p className={text()}>Abrir sidebar</p>
        <SidebarIcon action="open" side={sidebar.side} size={32} />
      </button>
    </div>
  )
}
