import type { LayoutProps } from "~/lib/types"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col gap-12">
      <p className="text-4xl font-semibold">Modificar capítulo</p>
      {children}
    </div>
  )
}
