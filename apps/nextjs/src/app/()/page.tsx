import Image from "next/image";

import { auth } from "@taiyo/auth";

export const runtime = "edge";

export default async function HomePage() {
  const session = await auth();

  console.log(session);

  return (
    <div>
      <p className="text-4xl">Taiyō</p>
      <p>{session?.user.id}</p>
      <p>{session?.user.name}</p>
      <p>{session?.user.email}</p>
      <Image
        src={session?.user?.image ?? ""}
        width={150}
        height={150}
        alt="profile picture"
      />
    </div>
  );
}
