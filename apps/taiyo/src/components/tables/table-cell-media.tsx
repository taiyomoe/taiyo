import { MediaUtils } from "@taiyomoe/utils"
import Link from "next/link"
import { CopyText } from "~/components/generics/texts/copy-text"

type Props = {
  media: { id: string; mainTitle: string }
}

export const TableCellMedia = ({ media }: Props) => (
  <div className="flex items-center gap-2">
    <Link
      href={MediaUtils.getUrl(media)}
      className="underline underline-offset-4 transition-colors hover:text-foreground-400"
      target="_blank"
    >
      {media.mainTitle}
    </Link>
    <CopyText text={media.id} />
  </div>
)
