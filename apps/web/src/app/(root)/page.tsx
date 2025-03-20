import { getTranslations } from "next-intl/server"
import { Button } from "../../components/ui/button"

export default async function Page() {
  const t = await getTranslations("home")

  return (
    <main className="flex flex-col space-y-8 p-4">
      <h1>{t("title")}</h1>
      <Button>Click me</Button>
      <Button variant="outline">Click me</Button>
    </main>
  )
}
