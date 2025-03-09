"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRef } from "react"
import { ArrowLeftIcon } from "~/components/icons/arrow-left-icon"

export const GoBackButton = () => {
  const t = useTranslations("notFound")
  const ref = useRef<HTMLAnchorElement>(null)

  return (
    <Link
      ref={ref}
      href="/"
      className="flex items-center gap-2 rounded border bg-inverted px-3 py-2 text-inverted transition hover:bg-inverted/80"
    >
      <ArrowLeftIcon parentRef={ref} />
      {t("action")}
    </Link>
  )
}
