import { db } from "@taiyomoe/db"
import { notFound } from "next/navigation"
import { UserLayout } from "./_components/user-layout"

type Props = {
  params: { userId: string }
}

export default async function Page({ params }: Props) {
  const user = await db.user.findUnique({ where: { id: params.userId } })

  if (!user) {
    return notFound()
  }

  return <UserLayout user={user} />
}
