"use client";

import { Button } from "@nextui-org/button";
import { useAtom, useAtomValue } from "jotai";

import {
  readerSidebarOpenModeAtom,
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";
import { useChapterNavigation } from "~/hooks/useChapterNavigation";

import { SidebarIcon } from "../icons/SidebarIcon";

export const ReaderSidebarOpenButton = () => {
  const { chapter } = useChapterNavigation();
  const readerSidebarOpenMode = useAtomValue(readerSidebarOpenModeAtom);
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);
  const [readerSidebarState, setReaderSidebarState] = useAtom(
    readerSidebarStateAtom,
  );

  if (
    !chapter ||
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
