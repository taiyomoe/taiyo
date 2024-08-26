import { Divider } from "@nextui-org/divider"
import { auth } from "@taiyomoe/auth"
import { notFound } from "next/navigation"
import type { LayoutProps } from "~/lib/types"

export default async function Layout({ children }: LayoutProps) {
  const session = await auth()

  if (!session || session.user.role.name !== "ADMIN") {
    notFound()
  }

  return (
    <div className="flex items-center justify-center p-bodyPadding">
      <div className="w-full max-w-7xl">
        <p className="font-semibold text-4xl">Configurações</p>
        <Divider className="my-8" />
        {children}
      </div>
    </div>
  )
}
