import { redirect } from "next/navigation";

import { auth } from "@taiyo/auth";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { AuthCard } from "./_components/AuthCard";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-fit w-full flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-8 sm:flex-row">
        <CompanyLogo company="taiyo" width={150} height={100} />
        <p className="text-5xl font-bold">Taiyō</p>
      </div>
      <AuthCard />
    </div>
  );
}
