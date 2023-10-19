import { redirect } from "next/navigation";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { getServerAuthSession } from "~/lib/auth/utils";
import { AuthCard } from "./_components/AuthCard";

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 px-8">
      <div className="flex flex-col items-center gap-8 sm:flex-row">
        <CompanyLogo company="taiyo" width={150} height={100} />
        <p className="text-5xl font-bold">Taiyō</p>
      </div>
      <AuthCard />
    </div>
  );
}
