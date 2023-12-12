"use client";

import { Button } from "@nextui-org/button";

import { useReaderStore } from "~/stores";

import { SidebarIcon } from "../icons/SidebarIcon";

export const ReaderSidebarOpenButton = () => {
  const { settings, updateSettings, chapter } = useReaderStore();

  if (
    !chapter ||
    settings.sidebar.openMode === "hover" ||
    settings.sidebar.state === "show"
  ) {
    return null;
  }

  return (
    <Button
      startContent={<SidebarIcon action="open" side={settings.sidebar.side} />}
      onPress={() => updateSettings("sidebar.state", "show")}
      isIconOnly
    />
  );
};
