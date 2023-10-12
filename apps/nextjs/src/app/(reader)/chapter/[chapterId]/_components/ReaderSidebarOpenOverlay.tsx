"use client";

import { useAtom, useAtomValue } from "jotai";
import { tv } from "tailwind-variants";

import {
  readerSidebarOpenModeAtom,
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";
import { SidebarIcon } from "~/components/icons/SidebarIcon";
import type { ReaderSettings } from "~/types/readerSettings.types";

const readerSidebarOpenOverlay = tv({
  slots: {
    button:
      "group absolute z-20 flex select-none flex-col items-center bg-opacity-50 p-8 text-neutral-300 opacity-0 transition-all hover:cursor-pointer hover:opacity-100",
    accent: "group-hover:shadow-intense",
    text: "text-large mb-2 font-medium",
  },
  variants: {
    hide: {
      true: {
        button: "hidden",
      },
    },
    side: {
      left: {},
      right: {
        button: "right-0",
      },
    },
  },
});

type Props = {
  side: ReaderSettings["sidebarSide"];
};

export const ReaderSidebarOpenOverlay = ({ side }: Props) => {
  const readerSidebarOpenMode = useAtomValue(readerSidebarOpenModeAtom);
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);
  const [readerSidebarState, setReaderSidebarState] = useAtom(
    readerSidebarStateAtom,
  );

  const { button, accent, text } = readerSidebarOpenOverlay({
    hide: readerSidebarState === "show",
    side: readerSidebarSide,
  });

  if (readerSidebarOpenMode === "button" || readerSidebarSide !== side) {
    return null;
  }

  return (
    <button className={button()} onClick={() => setReaderSidebarState("show")}>
      <span className={accent()} />
      <p className={text()}>Abrir sidebar</p>
      <SidebarIcon action="open" side={readerSidebarSide} size={32} />
    </button>
  );
};
