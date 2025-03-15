import Link from "next/link"
import { TaiyoLogo } from "~/components/logos/taiyo-logo"
import { BackHomeButton } from "~/components/ui/back-home-button"
import { AccountNotLinkedAuthError } from "./_components/account-not-linked-auth-error"
import { UnknownAuthError } from "./_components/unknown-auth-error"

type Props = { searchParams: Promise<{ code: string }> }

export default async function Page({ searchParams }: Props) {
  const { code } = await searchParams
  const isKnownError = ["account_not_linked"].includes(code)

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-subtle p-4 md:gap-14 md:py-12 dark:bg-default">
      <Link id="auth-logo" href="/" className="flex items-center gap-2">
        <TaiyoLogo className="size-20" />
        <h2 className="font-bold text-4xl tracking-tight">Taiyō</h2>
      </Link>
      {code === "account_not_linked" && <AccountNotLinkedAuthError />}
      {!isKnownError && <UnknownAuthError />}
      <BackHomeButton className="w-fit" />
    </main>
  )
}
