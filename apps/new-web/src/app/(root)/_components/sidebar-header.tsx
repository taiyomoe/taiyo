import Image from "next/image"
import Link from "next/link"

export const SidebarHeader = () => (
  <div className="flex items-center justify-center gap-4 border-subtle border-b p-4">
    <Link
      href="/"
      className="flex items-center justify-center gap-2 font-bold text-xl"
    >
      <Image src="/logo-red.svg" alt="logo" width={36} height={36} />
      Taiyō
    </Link>
    <div className="rounded-full border bg-emphasis px-2 py-1 text-xs uppercase">
      Alpha
    </div>
  </div>
)
