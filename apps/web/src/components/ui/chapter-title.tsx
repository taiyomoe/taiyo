import { useTranslations } from "next-intl"
import { type HTMLAttributes, useMemo } from "react"

type Props = Omit<HTMLAttributes<HTMLSpanElement>, "title"> & {
  title: string | null
  number: number
}

export const ChapterTitle = ({ title, number, ...props }: Props) => {
  const t = useTranslations("global")
  const computed = useMemo(
    () =>
      title
        ? `${t("chapter")} ${number} — ${title}`
        : `${t("chapter")} ${number}`,
    [title, number, t],
  )

  return (
    <span {...props} title={computed}>
      {computed}
    </span>
  )
}
