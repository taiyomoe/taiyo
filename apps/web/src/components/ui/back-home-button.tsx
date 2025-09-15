"use client"

import { buttonVariants } from "@taiyomoe/ui/components/button"
import { cn } from "@taiyomoe/ui/utils/cn"
import { ArrowLeftIcon } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { useTranslations } from "next-intl"

type Props = Omit<LinkProps, "href"> & { className?: string }

export const BackHomeButton = ({ className, ...props }: Props) => {
  const t = useTranslations("global")

  return (
    <Link
      className={buttonVariants({
        className: cn("hover:[&_svg]:-translate-x-1", className),
      })}
      href="/"
      {...props}
    >
      <ArrowLeftIcon />
      {t("backHome")}
    </Link>
  )
}
