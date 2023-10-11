"use client";

import { Button, ButtonGroup } from "@nextui-org/button";
import { useAtom } from "jotai";
import { PanelLeftOpenIcon, PanelRightOpenIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { readerSidebarSideAtom } from "~/atoms/readerSettings.atoms";
import type { ReaderSettings } from "~/types/readerSettings.types";

const readerSidebarSettingsSide = tv({
  slots: {
    container: "flex items-center gap-4",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsSide = () => {
  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsSide();
  const [readerSidebarSide, setReaderSidebarSide] = useAtom(
    readerSidebarSideAtom,
  );

  const handlePress = (side: ReaderSettings["sidebarSide"]) => {
    setReaderSidebarSide(side);
  };

  return (
    <div className={container()}>
      <p className={text()}>Sidebar</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<PanelLeftOpenIcon size={20} />}
          variant={readerSidebarSide === "left" ? "faded" : "solid"}
          onPress={() => handlePress("left")}
          radius="sm"
        >
          Left
        </Button>
        <Button
          className={rightButton()}
          endContent={<PanelRightOpenIcon size={20} />}
          onPress={() => handlePress("right")}
          variant={readerSidebarSide === "right" ? "faded" : "solid"}
          radius="sm"
        >
          Right
        </Button>
      </ButtonGroup>
    </div>
  );
};
