import { Divider } from "@nextui-org/divider"
import type { LayoutProps } from "~/lib/types"

export default async function Layout({ children }: LayoutProps) {
  return (
    <main className="w-full max-w-7xl place-self-center p-bodyPadding">
      <div className="flex flex-col">
        <p className="font-semibold text-4xl">Configurações</p>
        <Divider className="my-8" />
        {children}
      </div>
    </main>
  )
}
