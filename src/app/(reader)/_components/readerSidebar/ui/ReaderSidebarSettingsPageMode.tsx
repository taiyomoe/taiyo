"use client";

import { Button, ButtonGroup } from "@nextui-org/button";
import { FileIcon, ScrollTextIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { useReaderStore } from "~/stores";

const readerSidebarSettingsPageMode = tv({
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
    readerSidebarSettingsPageMode();

  return (
    <div className={container()}>
      <p className={text()}>Páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FileIcon size={20} />}
          onPress={() => updateSettings("page.mode", "single")}
          color={settings.page.mode === "single" ? "primary" : "default"}
          radius="sm"
        >
          Única
        </Button>
        <Button
          className={rightButton()}
          endContent={<ScrollTextIcon size={20} />}
          onPress={() => updateSettings("page.mode", "longstrip")}
          color={settings.page.mode === "longstrip" ? "primary" : "default"}
          radius="sm"
        >
          Cascata
        </Button>
      </ButtonGroup>
    </div>
  );
};
