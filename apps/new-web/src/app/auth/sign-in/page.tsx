import Link from "next/link"
import { TaiyoLogo } from "~/components/logos/taiyo-logo"
import { SignInFlow } from "./_components/sign-in-flow"

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-subtle p-4 md:gap-14 md:py-12 dark:bg-default">
      <Link id="auth-logo" href="/" className="flex items-center gap-2">
        <TaiyoLogo className="size-20" />
        <h2 className="font-bold text-4xl tracking-tight">Taiyō</h2>
      </Link>
      <SignInFlow />
    </main>
  )
}
