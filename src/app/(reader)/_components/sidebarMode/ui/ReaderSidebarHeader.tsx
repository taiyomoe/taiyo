"use client";

import { Button } from "@nextui-org/button";
import { tv } from "tailwind-variants";

import { SidebarIcon } from "~/components/icons/SidebarIcon";
import { useReaderStore } from "~/stores";

import { ReaderSidebarMediaTitle } from "../ui/ReaderSidebarMediaTitle";

const readerSidebarHeader = tv({
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

export const ReaderSidebarHeader = () => {
  const { settings, updateSettings } = useReaderStore();

  const slots = readerSidebarHeader({ side: settings.sidebar.side });

  const handlePress = () => {
    updateSettings(
      "sidebar.state",
      settings.sidebar.state === "show" ? "hide" : "show",
    );
  };

  return (
    <div className={slots.container()}>
      <ReaderSidebarMediaTitle className={slots.text()} />
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
