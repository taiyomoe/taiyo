"use client";

import { Button } from "@nextui-org/button";
import { useAtom, useAtomValue } from "jotai";
import { tv } from "tailwind-variants";

import {
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";
import { SidebarIcon } from "~/components/icons/SidebarIcon";
import { DisplayMediaChapterTitle } from "~/components/ui/DisplayMediaChapterTitle";

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
  const [readerSidebarState, setReaderSidebarState] = useAtom(
    readerSidebarStateAtom,
  );
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);

  const { container, text } = readerSidebarTitle({ side: readerSidebarSide });

  return (
    <div className={container()}>
      <DisplayMediaChapterTitle className={text()} />
      <Button
        startContent={
          <SidebarIcon action="close" side={readerSidebarSide} size={20} />
        }
        onPress={() =>
          setReaderSidebarState(readerSidebarState === "show" ? "hide" : "show")
        }
        size="sm"
        isIconOnly
      />
    </div>
  );
};
