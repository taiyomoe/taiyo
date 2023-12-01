"use client";

import { Button, ButtonGroup } from "@nextui-org/button";
import { FileIcon, ScrollTextIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { useReaderStore } from "~/stores";

const readerSidebarSettingsOpenMode = tv({
  slots: {
    container: "flex flex-col gap-2 items-end",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsPageMode = () => {
  const { settings, updateSettings } = useReaderStore();

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsOpenMode();

  return (
    <div className={container()}>
      <p className={text()}>Páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FileIcon size={20} />}
          color={settings.pageMode === "single" ? "primary" : "default"}
          onPress={() => updateSettings("pageMode", "single")}
          radius="sm"
        >
          Única
        </Button>
        <Button
          className={rightButton()}
          endContent={<ScrollTextIcon size={20} />}
          onPress={() => updateSettings("pageMode", "longstrip")}
          color={settings.pageMode === "longstrip" ? "primary" : "default"}
          radius="sm"
        >
          Cascata
        </Button>
      </ButtonGroup>
    </div>
  );
};
