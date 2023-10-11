import { atomWithStorage } from "jotai/utils";

import type { ReaderSettings } from "~/types/readerSettings.types";

export const readerSidebarStateAtom = atomWithStorage<
  ReaderSettings["sidebarState"]
>("readerSidebarState", "show");

export const readerSidebarSideAtom = atomWithStorage<
  ReaderSettings["sidebarSide"]
>("readerSidebarSide", "right");
