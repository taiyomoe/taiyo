import { getTranslations } from "next-intl/server"

export default async function Page() {
  const t = await getTranslations("home")

  return <div>{t("title")}</div>
}
