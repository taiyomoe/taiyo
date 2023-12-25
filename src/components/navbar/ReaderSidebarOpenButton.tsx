"use client";

import { Button } from "@nextui-org/button";

import { useReaderSettingsStore, useReaderStore } from "~/stores";

import { SidebarIcon } from "../icons/SidebarIcon";

export const ReaderSidebarOpenButton = () => {
  const { chapter } = useReaderStore();
  const { sidebar, update } = useReaderSettingsStore();

  if (!chapter || sidebar.openMode === "hover" || sidebar.state === "show") {
    return null;
  }

  return (
    <Button
      startContent={<SidebarIcon action="open" side={sidebar.side} />}
      onPress={() => update("sidebar.state", "show")}
      isIconOnly
    />
  );
};
