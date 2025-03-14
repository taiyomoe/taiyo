import Link from "next/link"
import { TaiyoLogo } from "~/components/logos/taiyo-logo"
import { MissingToken } from "./_components/missing-token"
import { ResetPasswordForm } from "./_components/reset-password-form"

type Props = {
  searchParams: Promise<{ token: string }>
}
export default async function Page(props: Props) {
  const searchParams = await props.searchParams

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-subtle p-4 md:gap-14 md:py-12 dark:bg-default">
      <Link id="auth-logo" href="/" className="flex items-center gap-2">
        <TaiyoLogo className="size-20" />
        <h2 className="font-bold text-4xl tracking-tight">Taiyō</h2>
      </Link>
      {searchParams.token && <ResetPasswordForm token={searchParams.token} />}
      {!searchParams.token && <MissingToken />}
    </main>
  )
}
