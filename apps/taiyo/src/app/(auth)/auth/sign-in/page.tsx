import { auth } from "@taiyomoe/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { DiscordAuthButton } from "~/app/(auth)/auth/sign-in/_components/discord-auth-button"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export default async function SignInPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex w-full flex-col items-center gap-12 px-8">
      <Link
        href="/"
        className="flex flex-col items-center gap-8 transition-transform hover:scale-[1.02] sm:flex-row"
      >
        <CompanyLogo company="taiyo" width={150} height={100} />
        <p className="font-bold text-5xl">Taiyō</p>
      </Link>
      <div className="text-center">
        <p>Por enquanto, a única opção de login é o Discord.</p>
        <p className="mb-4">Mais opções aparecerão em breve.</p>
        <DiscordAuthButton />
      </div>
    </div>
  )
}
