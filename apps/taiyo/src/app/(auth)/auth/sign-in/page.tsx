import { auth } from "@taiyomoe/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CompanyLogo } from "~/components/ui/CompanyLogo"
import { AuthCard } from "./_components/AuthCard"

export default async function SignInPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 px-8">
      <Link href="/" className="flex flex-col items-center gap-8 sm:flex-row">
        <CompanyLogo company="taiyo" width={150} height={100} />
        <p className="font-bold text-5xl">Taiyō</p>
      </Link>
      <AuthCard />
    </div>
  )
}
