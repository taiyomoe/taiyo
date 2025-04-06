import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

export const LatestReleasesPageButton = () => {
  return (
    <Link
      href="/chapters/latest"
      className="p-1 text-subtle transition-transform duration-300 hover:translate-x-1 hover:text-default"
    >
      <ArrowRightIcon className="size-5 transition-colors" />
    </Link>
  )
}
