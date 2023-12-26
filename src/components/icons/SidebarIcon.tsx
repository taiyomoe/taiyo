import type { LucideProps } from "lucide-react"
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
} from "lucide-react"

import type { ReaderSettings } from "~/lib/types"

type Props = {
  action: "open" | "close"
  side: ReaderSettings["sidebar"]["side"]
} & LucideProps

export const SidebarIcon = ({ action, side, ...rest }: Props) => {
  if (action === "open" && side === "left")
    return <PanelLeftOpenIcon {...rest} />

  if (action === "open" && side === "right")
    return <PanelRightOpenIcon {...rest} />

  if (action === "close" && side === "left")
    return <PanelLeftCloseIcon {...rest} />

  return <PanelRightCloseIcon {...rest} />
}
