import { atomWithStorage } from "jotai/utils";

import type { ReaderSettings } from "~/types/readerSettings.types";

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
