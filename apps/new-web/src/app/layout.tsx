import type { LayoutProps } from "~/utils/types"

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
