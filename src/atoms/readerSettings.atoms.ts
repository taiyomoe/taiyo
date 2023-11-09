import { atomWithStorage } from "jotai/utils";

import type { ReaderSettings } from "~/lib/types";

export const readerSidebarStateAtom = atomWithStorage<
  ReaderSettings["sidebarState"]
>("readerSidebarState", "show");

export const readerSidebarSideAtom = atomWithStorage<
  ReaderSettings["sidebarSide"]
>("readerSidebarSide", "right");

export const readerSidebarOpenModeAtom = atomWithStorage<
  ReaderSettings["sidebarOpenMode"]
>("readerSidebarOpenMode", "button");

export const readerNavbarModeAtom = atomWithStorage<
  ReaderSettings["navbarMode"]
>("readerNavbarMode", "sticky");

export const readerPageModeAtom = atomWithStorage<ReaderSettings["pageMode"]>(
  "readerPageMode",
  "single",
);
