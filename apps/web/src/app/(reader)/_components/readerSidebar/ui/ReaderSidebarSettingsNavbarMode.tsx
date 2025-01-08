import { Button, ButtonGroup } from "@nextui-org/button"
import { tv } from "@nextui-org/react"
import { useDevice } from "~/hooks/useDevice"
import { useReaderSettingsStore } from "~/stores"

const readerSidebarSettingsNavbarMode = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    button: "justify-center gap-3",
  },
})

export const ReaderSidebarSettingsNavbarMode = () => {
  const { navbarMode, update } = useReaderSettingsStore()
  const device = useDevice()

  const { container, text, button } = readerSidebarSettingsNavbarMode()

  return (
    <div className={container()}>
      <p className={text()}>Modo da navbar</p>
      <ButtonGroup fullWidth radius="sm" color="primary">
        <Button
          className={button()}
          onPress={() => update("navbarMode", "fixed", true)}
          color={navbarMode === "fixed" ? "primary" : "default"}
        >
          Fixa
        </Button>
        <Button
          className={button()}
          onPress={() => update("navbarMode", "sticky", true)}
          color={navbarMode === "sticky" ? "primary" : "default"}
        >
          Sempre
        </Button>
        <Button
          className={button()}
          onPress={() => update("navbarMode", "hover", true)}
          color={navbarMode === "hover" ? "primary" : "default"}
          isDisabled={!device?.isAboveTablet}
        >
          Foco
        </Button>
      </ButtonGroup>
    </div>
  )
}
