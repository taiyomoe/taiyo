import Image from "next/image";

import { auth } from "@taiyo/auth";

import { SignOut } from "~/components/auth/SignOut";

export const runtime = "edge";

export default async function HomePage() {
  const session = await auth();

  return (
    <div>
      <p className="text-4xl">Taiyō</p>
      <div className="mt-8 flex gap-4">
        <p className="min-w-[100px]">Id</p>
        <p>{session?.user.id}</p>
      </div>
      <div className="flex gap-4">
        <p className="min-w-[100px]">Username</p>
        <p>{session?.user.name}</p>
      </div>
      <div className="mb-10 flex gap-4">
        <p className="min-w-[100px]">Email</p>
        <p>{session?.user.email}</p>
      </div>
      <Image
        src={session?.user?.image ?? ""}
        width={150}
        height={150}
        alt="profile picture"
      />
      <SignOut className="mt-10">
        <p>Deslogar</p>
      </SignOut>
    </div>
  );
}
