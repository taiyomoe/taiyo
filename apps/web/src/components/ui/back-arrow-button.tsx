"use client"

import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { cn } from "~/utils/cn"

export const BackArrowButton = ({
  className,
  ...props
}: ComponentProps<"button">) => {
  const t = useTranslations("global")

  return (
    <button
      className={cn(
        "hover:[&_svg]:-translate-x-1 flex items-center gap-2 text-subtle hover:underline",
        className,
      )}
      type="button"
      {...props}
    >
      <ArrowLeftIcon className="size-4 transition-transform" />
      {t("back")}
    </button>
  )
}
