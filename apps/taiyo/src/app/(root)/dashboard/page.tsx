import { useTranslations } from "next-intl"

export default function Page() {
  const t = useTranslations("home")

  return (
    <div className="p-4">
      <p className="text-foreground">{t("title")}</p>
    </div>
  )
}
