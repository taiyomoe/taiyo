"use client";

import { useAtom, useAtomValue } from "jotai";
import { tv } from "tailwind-variants";

import {
  readerSidebarOpenModeAtom,
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";
import { SidebarIcon } from "~/components/icons/SidebarIcon";

const readerSidebarOpenOverlay = tv({
  slots: {
    container: "fixed top-20 z-[15]",
    button:
      "group flex select-none flex-col items-center bg-opacity-50 p-8 text-neutral-300 opacity-0 transition-all hover:cursor-pointer hover:opacity-100",
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
      left: {
        container: "left-0",
      },
      right: {
        container: "right-4",
      },
    },
  },
});

export const ReaderSidebarOpenOverlay = () => {
  const readerSidebarOpenMode = useAtomValue(readerSidebarOpenModeAtom);
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);
  const [readerSidebarState, setReaderSidebarState] = useAtom(
    readerSidebarStateAtom,
  );

  const { container, button, accent, text } = readerSidebarOpenOverlay({
    hide: readerSidebarState === "show",
    side: readerSidebarSide,
  });

  if (readerSidebarOpenMode === "button") {
    return null;
  }

  console.log("readerSidebarOpenMode", readerSidebarOpenMode);
  console.log("readerSidebarSide", readerSidebarSide);

  return (
    <div className={container()}>
      <button
        className={button()}
        onClick={() => setReaderSidebarState("show")}
      >
        <span className={accent()} />
        <p className={text()}>Abrir sidebar</p>
        <SidebarIcon action="open" side={readerSidebarSide} size={32} />
      </button>
    </div>
  );
};
