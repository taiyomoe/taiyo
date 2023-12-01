"use client";

import { Button } from "@nextui-org/button";
import { tv } from "tailwind-variants";

import { SidebarIcon } from "~/components/icons/SidebarIcon";
import { MediaChapterTitle } from "~/components/ui/MediaChapterTitle";
import { useReaderStore } from "~/stores";

const readerSidebarTitle = tv({
  slots: {
    container: "flex w-full items-center gap-2",
    text: "text-lg font-semibold",
    icon: "",
  },
  variants: {
    side: {
      left: {
        container: "flex-row-reverse justify-end",
      },
      right: {
        container: "justify-between",
      },
    },
  },
});

export const ReaderSidebarTitle = () => {
  const { settings, updateSettings } = useReaderStore();

  const slots = readerSidebarTitle({ side: settings.sidebar.side });

  const handlePress = () => {
    updateSettings(
      "sidebar.state",
      settings.sidebar.state === "show" ? "hide" : "show",
    );
  };

  return (
    <div className={slots.container()}>
      <MediaChapterTitle className={slots.text()} />
      <Button
        startContent={
          <SidebarIcon action="close" side={settings.sidebar.side} size={20} />
        }
        onPress={handlePress}
        size="sm"
        isIconOnly
      />
    </div>
  );
};
