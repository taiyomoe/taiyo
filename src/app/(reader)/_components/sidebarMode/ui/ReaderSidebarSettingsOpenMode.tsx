"use client";

import { useEffect } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import { MousePointer2Icon } from "lucide-react";
import { tv } from "tailwind-variants";

import { SidebarIcon } from "~/components/icons/SidebarIcon";
import { useDevice } from "~/hooks/useDevice";
import { useReaderStore } from "~/stores";

const readerSidebarSettingsOpenMode = tv({
  slots: {
    container: "flex flex-col gap-2 items-end",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsOpenMode = () => {
  const { settings, updateSettings } = useReaderStore();
  const { isMobile } = useDevice();

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsOpenMode();

  useEffect(() => {
    if (isMobile && settings.sidebar.openMode === "hover") {
      updateSettings("sidebar.openMode", "button");
    }
  }, [isMobile, settings.sidebar.openMode, updateSettings]);

  return (
    <div className={container()}>
      <p className={text()}>Modo de abrir a sidebar</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={
            <SidebarIcon action="open" side={settings.sidebar.side} size={20} />
          }
          color={settings.sidebar.openMode === "button" ? "primary" : "default"}
          onPress={() => updateSettings("sidebar.openMode", "button")}
          isDisabled={isMobile}
          radius="sm"
        >
          Botão
        </Button>
        <Button
          className={rightButton()}
          endContent={<MousePointer2Icon size={20} />}
          onPress={() => updateSettings("sidebar.openMode", "hover")}
          color={settings.sidebar.openMode === "hover" ? "primary" : "default"}
          isDisabled={isMobile}
          radius="sm"
        >
          Foco
        </Button>
      </ButtonGroup>
    </div>
  );
};
