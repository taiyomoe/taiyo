import type { LayoutProps } from "@taiyomoe/types"

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="flex h-dvh flex-col items-center justify-center sm:py-12">
      {children}
    </main>
  )
}
