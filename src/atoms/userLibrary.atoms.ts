import { atom } from "jotai";

import type { ReaderSettings } from "~/lib/types";

export const userLibarySidebarStateAtom =
  atom<ReaderSettings["sidebarState"]>("hide");
