import { getTranslations } from "next-intl/server"
import { SignOutButton } from "~/app/(root)/_components/sign-out-button"
import { getSession } from "~/utils/get-session"

export default async function Page() {
  const t = await getTranslations("home")
  const session = await getSession()

  return (
    <main className="max-w-[calc(100vw-var(--sidebar-width))] space-y-8 p-4">
      <h1>{t("title")}</h1>
      <SignOutButton />
      <p className="whitespace-pre-wrap">{JSON.stringify(session, null, 4)}</p>
    </main>
  )
}
