import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { TaiyoLogo } from "~/components/logos/taiyo-logo"
import { Button } from "~/components/ui/button"
import { DiscordButton } from "~/components/ui/discord-button"
import { GoogleButton } from "~/components/ui/google-button"
import { Separator } from "~/components/ui/separator"

export default async function Page() {
  const t = await getTranslations()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-14 bg-subtle px-4 dark:bg-default">
      <Link href="/" className="absolute top-44 flex items-center gap-2">
        <TaiyoLogo className="size-20" />
        <h2 className="font-bold text-4xl tracking-tight">Taiyō</h2>
      </Link>
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <GoogleButton />
          <DiscordButton />
        </div>
        <Separator className="w-full bg-emphasis">{t("global.or")}</Separator>
        <div className="space-y-2">
          <Button variant="outline">{t("auth.email")}</Button>
        </div>
      </div>
    </main>
  )
}
