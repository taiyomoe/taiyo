"use client";

import { useEffect } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import { useAtom, useAtomValue } from "jotai";
import { MousePointer2Icon } from "lucide-react";
import { tv } from "tailwind-variants";

import {
  readerSidebarOpenModeAtom,
  readerSidebarSideAtom,
} from "~/atoms/readerSettings.atoms";
import { SidebarIcon } from "~/components/icons/SidebarIcon";
import { useDevice } from "~/hooks/useDevice";
import type { ReaderSettings } from "~/lib/types";

const readerSidebarSettingsOpenMode = tv({
  slots: {
    container: "flex flex-col gap-2 items-end",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsOpenMode = () => {
  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsOpenMode();

  const { isMobile } = useDevice();
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);
  const [readerSidebarOpenMode, setReaderSidebarOpenMode] = useAtom(
    readerSidebarOpenModeAtom,
  );

  const handlePress = (side: ReaderSettings["sidebarOpenMode"]) => {
    setReaderSidebarOpenMode(side);
  };

  useEffect(() => {
    if (isMobile) {
      setReaderSidebarOpenMode("button");
    }
  }, [isMobile, setReaderSidebarOpenMode]);

  return (
    <div className={container()}>
      <p className={text()}>Modo de abrir a sidebar</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={
            <SidebarIcon action="open" side={readerSidebarSide} size={20} />
          }
          color={readerSidebarOpenMode === "button" ? "primary" : "default"}
          onPress={() => handlePress("button")}
          isDisabled={isMobile}
          radius="sm"
        >
          Botão
        </Button>
        <Button
          className={rightButton()}
          endContent={<MousePointer2Icon size={20} />}
          onPress={() => handlePress("hover")}
          color={readerSidebarOpenMode === "hover" ? "primary" : "default"}
          isDisabled={isMobile}
          radius="sm"
        >
          Foco
        </Button>
      </ButtonGroup>
    </div>
  );
};
