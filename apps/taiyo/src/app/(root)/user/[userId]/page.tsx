import { notFound } from "next/navigation"
import { UsersService } from "~/services/users.web-service"
import { UserLayout } from "./_components/user-layout"

type Props = {
  params: { userId: string }
}

export default async function Page({ params }: Props) {
  const user = await UsersService.getLimited(params.userId)

  if (!user) {
    return notFound()
  }

  return <UserLayout user={user} />
}
