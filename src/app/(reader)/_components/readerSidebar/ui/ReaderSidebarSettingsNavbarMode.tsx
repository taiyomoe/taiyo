import { Button, ButtonGroup } from "@nextui-org/button";
import { tv } from "tailwind-variants";

import { useReaderStore } from "~/stores";

const readerSidebarSettingsNavbarMode = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    button: "justify-center gap-3",
  },
});

export const ReaderSidebarSettingsNavbarMode = () => {
  const { settings, updateSettings } = useReaderStore();

  const { container, text, button } = readerSidebarSettingsNavbarMode();

  return (
    <div className={container()}>
      <p className={text()}>Modo da navbar</p>
      <ButtonGroup fullWidth radius="sm" color="primary">
        <Button
          className={button()}
          onPress={() => updateSettings("navbarMode", "fixed")}
          color={settings.navbarMode === "fixed" ? "primary" : "default"}
        >
          Fixa
        </Button>
        <Button
          className={button()}
          onPress={() => updateSettings("navbarMode", "sticky")}
          color={settings.navbarMode === "sticky" ? "primary" : "default"}
        >
          Sempre
        </Button>
        <Button
          className={button()}
          onPress={() => updateSettings("navbarMode", "hover")}
          color={settings.navbarMode === "hover" ? "primary" : "default"}
        >
          Foco
        </Button>
      </ButtonGroup>
    </div>
  );
};
