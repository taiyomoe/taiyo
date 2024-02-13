import { tv } from "@nextui-org/react"

import { useReaderSettingsStore } from "~/stores"

type Props = {
  url: string
  hide: boolean
}

const mediaChapterImage = tv({
  base: "select-none",
  variants: {
    hide: {
      true: "hidden",
      false: "block",
    },
    navbarMode: {
      fixed: "",
      sticky: "",
      hover: "",
    },
    mode: {
      single: "m-auto",
      longstrip: "h-[unset] w-auto",
    },
    height: {
      fit: "",
      full: "",
    },
    width: {
      fit: "max-w-full object-contain",
      full: "",
    },
  },
  compoundVariants: [
    {
      navbarMode: ["fixed", "sticky"],
      mode: "single",
      height: "fit",
      className: "max-h-reader",
    },
    {
      navbarMode: ["hover"],
      mode: "single",
      height: "fit",
      className: "max-h-dvh",
    },
    {
      mode: "single",
      width: "full",
      className: "max-w-[unset]",
    },
    {
      height: "fit",
      width: "full",
      className: "max-h-[calc(var(--reader-height)-8px)]",
    },
  ],
})

export const MediaChapterImage = ({ url, hide }: Props) => {
  const {
    navbarMode,
    page: { mode, height, width, brightness },
  } = useReaderSettingsStore()

  const base = mediaChapterImage({ hide, navbarMode, mode, height, width })

  return (
    <img
      src={url}
      className={base}
      alt="chapter's page"
      style={{ filter: `brightness(${brightness / 100})` }}
    />
  )
}
