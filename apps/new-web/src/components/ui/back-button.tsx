"use client"

import { useTranslations } from "next-intl"
import { useRef } from "react"
import { Button, type ButtonProps } from "react-aria-components"
import { ArrowLeftIcon } from "~/components/icons/arrow-left-icon"
import { cn } from "~/utils/cn"

type Props = ButtonProps

export const BackButton = ({ className, ...props }: Props) => {
  const parentRef = useRef<HTMLButtonElement>(null)
  const t = useTranslations("global")

  return (
    <Button
      ref={parentRef}
      className={cn(
        "flex items-center gap-2 text-subtle hover:underline",
        className,
      )}
      {...props}
    >
      <ArrowLeftIcon parentRef={parentRef} />
      {t("back")}
    </Button>
  )
}
