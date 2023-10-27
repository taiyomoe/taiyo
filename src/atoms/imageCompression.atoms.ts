import { atom } from "jotai";

import { type SelectedImage } from "~/lib/types";

export const selectedImagesAtom = atom<SelectedImage[]>([]);
