import type { LayoutProps } from "~/lib/types"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col gap-12">
      <p className="font-semibold text-4xl">Upar capítulos em massa</p>
      <div className="flex grow flex-col gap-8">{children}</div>
    </div>
  )
}
