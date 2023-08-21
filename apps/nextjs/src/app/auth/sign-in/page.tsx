import { redirect } from "next/navigation";

import { auth } from "@taiyo/auth";

import { TaiyoLogo } from "~/components/logos/TaiyoLogo";
import { AuthCard } from "./_components/AuthCard";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <div className="flex items-center gap-8">
        <TaiyoLogo width={150} height={100} />
        <p className="text-5xl font-bold">Taiyō</p>
      </div>
      <AuthCard />
    </div>
  );
}
