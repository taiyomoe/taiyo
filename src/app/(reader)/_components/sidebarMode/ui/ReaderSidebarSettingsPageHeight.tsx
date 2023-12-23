"use client";

import { Button, ButtonGroup } from "@nextui-org/button";
import { FoldVerticalIcon, UnfoldVerticalIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { useReaderStore } from "~/stores";

const readerSidebarSettingsPageHeight = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsPageHeight = () => {
  const { settings, updateSettings } = useReaderStore();

  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsPageHeight();

  const isPageHeightFit =
    settings.page.mode !== "longstrip" && settings.page.height === "fit";

  return (
    <div className={container()}>
      <p className={text()}>Altura das páginas</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<FoldVerticalIcon size={20} />}
          onPress={() => updateSettings("page.height", "fit")}
          color={isPageHeightFit ? "primary" : "default"}
          isDisabled={settings.page.mode === "longstrip"}
          radius="sm"
        >
          Limitada
        </Button>
        <Button
          className={rightButton()}
          endContent={<UnfoldVerticalIcon size={20} />}
          onPress={() => updateSettings("page.height", "full")}
          color={isPageHeightFit ? "default" : "primary"}
          isDisabled={settings.page.mode === "longstrip"}
          radius="sm"
        >
          Livre
        </Button>
      </ButtonGroup>
    </div>
  );
};
