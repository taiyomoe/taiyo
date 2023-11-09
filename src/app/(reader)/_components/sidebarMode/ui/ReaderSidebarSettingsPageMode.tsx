"use client";

import { Button, ButtonGroup } from "@nextui-org/button";
import { useAtom } from "jotai";
import { FileIcon, ScrollTextIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { readerPageModeAtom } from "~/atoms/readerSettings.atoms";
import type { ReaderSettings } from "~/lib/types";

const readerSidebarSettingsOpenMode = tv({
  slots: {
    container: "flex flex-col gap-2 items-end",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsPageMode = () => {
  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsOpenMode();

  const [readerSidebarPageMode, setReaderPageModeAtom] =
    useAtom(readerPageModeAtom);

  const handlePress = (pageMode: ReaderSettings["pageMode"]) => {
    setReaderPageModeAtom(pageMode);
  };

  return (
    <div className={container()}>
      <p className={text()}>Páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FileIcon size={20} />}
          color={readerSidebarPageMode === "single" ? "primary" : "default"}
          onPress={() => handlePress("single")}
          radius="sm"
        >
          Única
        </Button>
        <Button
          className={rightButton()}
          endContent={<ScrollTextIcon size={20} />}
          onPress={() => handlePress("longstrip")}
          color={readerSidebarPageMode === "longstrip" ? "primary" : "default"}
          radius="sm"
        >
          Cascata
        </Button>
      </ButtonGroup>
    </div>
  );
};
