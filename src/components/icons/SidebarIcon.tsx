import type { LucideProps } from "lucide-react";
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
} from "lucide-react";

import type { ReaderSettings } from "~/types/readerSettings.types";

type Props = {
  action: "open" | "close";
  side: ReaderSettings["sidebarSide"];
} & LucideProps;

export const SidebarIcon = ({ action, side, ...rest }: Props) => {
  if (action === "open" && side === "left")
    return <PanelLeftOpenIcon {...rest} />;
  else if (action === "open" && side === "right")
    return <PanelRightOpenIcon {...rest} />;
  else if (action === "close" && side === "left")
    return <PanelLeftCloseIcon {...rest} />;
  else return <PanelRightCloseIcon {...rest} />;
};
