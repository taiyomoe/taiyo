import Link from "next/link"
import { CopyText } from "~/components/generics/texts/copy-text"

type Props = {
  scans: { id: string; name: string }[]
}

export const TableCellScans = ({ scans }: Props) => {
  const comps = scans.map((s) => (
    <div key={s.id} className="flex items-center gap-2">
      <Link
        href={`/scans/${s.id}`}
        className="underline underline-offset-4 transition-colors hover:text-foreground-400"
        target="_blank"
      >
        {s.name}
      </Link>
      <CopyText text={s.id} />
    </div>
  ))

  return <div className="flex flex-wrap gap-2">{comps}</div>
}
