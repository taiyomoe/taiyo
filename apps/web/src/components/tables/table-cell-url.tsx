import { ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  url: string | null
}

export const TableCellUrl = ({ url }: Props) => {
  if (!url) return null

  return (
    <Link href={url} className="flex items-center gap-3" target="_blank">
      <p className="font-medium underline underline-offset-4 transition-colors hover:text-foreground-400">
        {url}
      </p>
      <ExternalLinkIcon className="text-default-400" size={14} />
    </Link>
  )
}
