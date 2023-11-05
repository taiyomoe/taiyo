"use client";

import { usePathname } from "next/navigation";
import { Button } from "@nextui-org/button";
import { useAtom, useAtomValue } from "jotai";

import {
  readerSidebarOpenModeAtom,
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";

import { SidebarIcon } from "../icons/SidebarIcon";

export const ReaderSidebarOpenButton = () => {
  const pathname = usePathname();
  const readerSidebarOpenMode = useAtomValue(readerSidebarOpenModeAtom);
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);
  const [readerSidebarState, setReaderSidebarState] = useAtom(
    readerSidebarStateAtom,
  );

  if (
    !pathname.includes("/chapter/") ||
    readerSidebarOpenMode === "hover" ||
    readerSidebarState === "show"
  ) {
    return null;
  }

  return (
    <Button
      startContent={<SidebarIcon action="open" side={readerSidebarSide} />}
      onPress={() => setReaderSidebarState("show")}
      isIconOnly
    />
  );
};
