import type { Selection } from "@nextui-org/react";

const getSelectedKey = (selection: Selection) =>
  (selection as Set<Selection>).values().next().value as string;

export const SelectUtils = {
  getSelectedKey,
};
