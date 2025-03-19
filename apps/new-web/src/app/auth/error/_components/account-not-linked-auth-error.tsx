import { getTranslations } from "next-intl/server"

export const AccountNotLinkedAuthError = async () => {
  const t = await getTranslations("auth.errors.accountNotLinked")

  return (
    <div className="max-w-md space-y-2 text-center">
      <h1 className="font-bold text-2xl">{t("title")}</h1>
      <p className="text-sm text-subtle">{t("description")}</p>
    </div>
  )
}
