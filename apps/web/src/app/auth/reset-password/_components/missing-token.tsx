import { getTranslations } from "next-intl/server"

export const MissingToken = async () => {
  const t = await getTranslations("auth.resetPassword.missingToken")

  return (
    <div className="space-y-2 text-center">
      <h1 className="font-bold text-2xl">{t("title")}</h1>
      <p className="text-sm text-subtle">{t("description")}</p>
    </div>
  )
}

// ?token=fvH2BokvFZ5h211XQTUNffPq
