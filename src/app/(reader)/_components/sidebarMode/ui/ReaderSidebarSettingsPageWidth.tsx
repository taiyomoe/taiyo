"use client";

import { Button, ButtonGroup } from "@nextui-org/button";
import { FileIcon, ScrollTextIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { useReaderStore } from "~/stores";

const readerSidebarSettingsPageWidth = tv({
  slots: {
    container: "flex flex-col gap-2 items-end",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsPageWidth = () => {
  const { settings, updateSettings } = useReaderStore();

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsPageWidth();

  return (
    <div className={container()}>
      <p className={text()}>Largura das páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FileIcon size={20} />}
          onPress={() => updateSettings("page.width", "fit")}
          color={settings.page.width === "fit" ? "primary" : "default"}
          radius="sm"
        >
          Limitada
        </Button>
        <Button
          className={rightButton()}
          endContent={<ScrollTextIcon size={20} />}
          onPress={() => updateSettings("page.width", "full")}
          color={settings.page.width === "full" ? "primary" : "default"}
          radius="sm"
        >
          Livre
        </Button>
      </ButtonGroup>
    </div>
  );
};
