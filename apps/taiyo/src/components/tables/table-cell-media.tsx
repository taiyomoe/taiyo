import { MediaUtils } from "@taiyomoe/utils"
import Link from "next/link"

type Props = {
  media: { id: string; mainTitle: string }
}

export const TableCellMedia = ({ media }: Props) => (
  <Link
    href={MediaUtils.getUrl(media)}
    className="underline underline-offset-4 transition-colors hover:text-foreground-400"
    target="_blank"
  >
    {media.mainTitle}
  </Link>
)
