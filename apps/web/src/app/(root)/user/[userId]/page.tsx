import { notFound } from "next/navigation"
import { UsersService } from "~/services/users.web-service"
import { UserLayout } from "./_components/user-layout"

type Props = {
  params: Promise<{ userId: string }>
}

export default async function Page(props: Props) {
  const params = await props.params
  const user = await UsersService.getLimited(params.userId)

  if (!user) {
    return notFound()
  }

  return <UserLayout user={user} />
}
