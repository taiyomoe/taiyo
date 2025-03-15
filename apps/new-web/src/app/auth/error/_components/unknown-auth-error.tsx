import { getTranslations } from "next-intl/server"
import { BackHomeButton } from "~/components/ui/back-home-button"

export const UnknownAuthError = async () => {
  const t = await getTranslations("auth.errors.unknown")

  return (
    <div className="flex max-w-md flex-col items-center space-y-16">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        <p className="text-sm text-subtle">{t("description")}</p>
      </div>
      <BackHomeButton className="w-fit" />
    </div>
  )
}
