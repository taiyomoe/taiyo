"use client"

import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link, { type LinkProps } from "next/link"
import { buttonVariants } from "~/components/ui/button"
import { cn } from "~/utils/cn"

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
