import { notFound } from "next/navigation"
import { UsersService } from "~/services/users.web-service"
import { UserLayout } from "./_components/user-layout"

type Props = {
  params: Promise<{ userId: string }>
}

export default async function Page({ params }: Props) {
  const { userId } = await params
  const user = await UsersService.getLimited(userId)

  if (!user) {
    return notFound()
  }

  return <UserLayout user={user} />
}
