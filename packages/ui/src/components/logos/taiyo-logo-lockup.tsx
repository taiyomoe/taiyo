import { TaiyoLogo } from "@/components/logos/taiyo-logo"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export const TaiyoLogoLockup = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={cn("flex items-center gap-2 text-xl", className)} {...props}>
    <TaiyoLogo className="h-[1.4em] w-auto" />
    <span className="font-heading">Taiyō</span>
  </div>
)
