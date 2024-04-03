import type { LayoutProps } from "~/lib/types"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Upar capítulos em massa</p>
      {children}
    </div>
  )
}
