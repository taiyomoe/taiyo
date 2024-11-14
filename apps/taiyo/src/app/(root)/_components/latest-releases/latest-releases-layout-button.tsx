"use client"

import { Button, ButtonGroup } from "@nextui-org/button"
import type { HomeLayout } from "@taiyomoe/db"
import { useAtom } from "jotai"
import { useHydrateAtoms } from "jotai/utils"
import { Columns2Icon, Rows2Icon } from "lucide-react"
import { releasesLayoutAtom } from "~/atoms/homeLayout.atoms"
import { siteConfig } from "~/lib/config"

type Props = {
  initialLayout: HomeLayout
}

export const LatestReleasesLayoutButton = ({ initialLayout }: Props) => {
  useHydrateAtoms([[releasesLayoutAtom, initialLayout]])

  const [releasesLayout, setReleasesLayout] = useAtom(releasesLayoutAtom)

  const handlePress = (action: "ROWS" | "COLUMNS") => () => {
    const releasesLayoutContainer = document.getElementById(
      siteConfig.home.releasesLayoutContainerId,
    )

    if (!releasesLayoutContainer) return

    setReleasesLayout(action)
    releasesLayoutContainer.setAttribute("data-releases-layout", action)
  }

  return (
    <ButtonGroup isIconOnly>
      <Button
        onPress={handlePress("ROWS")}
        color={releasesLayout === "ROWS" ? "primary" : "default"}
      >
        <Rows2Icon />
      </Button>
      <Button
        onPress={handlePress("COLUMNS")}
        color={releasesLayout === "COLUMNS" ? "primary" : "default"}
      >
        <Columns2Icon />
      </Button>
    </ButtonGroup>
  )
}
