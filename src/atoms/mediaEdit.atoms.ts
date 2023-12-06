import { atom } from "jotai";

import type { MediaCoverVolume } from "~/lib/types";

export const mediaCoversEditAtom = atom<MediaCoverVolume[]>([]);
