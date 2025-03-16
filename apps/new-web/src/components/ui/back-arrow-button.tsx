"use client"

import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button, type ButtonProps } from "react-aria-components"
import { cn } from "~/utils/cn"

export const BackArrowButton = ({ className, ...props }: ButtonProps) => {
  const t = useTranslations("global")

  return (
    <Button
      className={cn(
        "hover:[&_svg]:-translate-x-1 flex items-center gap-2 text-subtle hover:underline",
        className,
      )}
      {...props}
    >
      <ArrowLeftIcon className="size-4 transition-transform" />
      {t("back")}
    </Button>
  )
}
