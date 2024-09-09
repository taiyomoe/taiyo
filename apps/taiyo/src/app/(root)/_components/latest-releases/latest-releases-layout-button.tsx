"use client"

import { Button, ButtonGroup } from "@nextui-org/button"
import { useAtom } from "jotai"
import { Columns2Icon, Rows2Icon } from "lucide-react"
import { releasesLayoutAtom } from "~/atoms/homeLayout.atoms"
import { siteConfig } from "~/lib/config"

export const LatestReleasesLayoutButton = () => {
  const [releasesLayout, setReleasesLayout] = useAtom(releasesLayoutAtom)

  const handlePress = (action: "rows" | "columns") => () => {
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
        onPress={handlePress("rows")}
        color={releasesLayout === "rows" ? "primary" : "default"}
      >
        <Rows2Icon />
      </Button>
      <Button
        onPress={handlePress("columns")}
        color={releasesLayout === "columns" ? "primary" : "default"}
      >
        <Columns2Icon />
      </Button>
    </ButtonGroup>
  )
}
