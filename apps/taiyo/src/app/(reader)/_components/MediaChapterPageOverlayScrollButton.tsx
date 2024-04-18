import { Button } from "@nextui-org/button"
import { throttle } from "lodash-es"
import { ChevronsUp } from "lucide-react"
import { useEffect } from "react"
import { useReaderSettingsStore } from "~/stores"

export const MediaChapterPageOverlayScrollButton = () => {
  const { page, update } = useReaderSettingsStore()

  const handlePress = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    if (page.overlay === "hide") {
      return
    }

    const onScroll = throttle(
      () => {
        const execute = async () => {
          // wait 500 ms
          await new Promise((resolve) => setTimeout(resolve, 200))

          update("page.overlay", "hide")
        }

        void execute()
      },
      1000,
      { trailing: false },
    )

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [page.overlay, update])

  return (
    <Button
      className="data-[disabled=true]:bg-default"
      startContent={<ChevronsUp />}
      onClick={handlePress}
      isDisabled={window.scrollY < 100}
      isIconOnly
    />
  )
}
