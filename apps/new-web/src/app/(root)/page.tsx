import { getTranslations } from "next-intl/server"
import { Button } from "../../components/ui/button"

export default async function Page() {
  const t = await getTranslations("home")

  return (
    <main className="flex max-w-[calc(100vw-var(--sidebar-width)-16px)] flex-col space-y-8 p-4 transition-[max-width] duration-300">
      <h1>{t("title")}</h1>
      <Button>Click me</Button>
      <Button variant="outline">Click me</Button>
    </main>
  )
}
