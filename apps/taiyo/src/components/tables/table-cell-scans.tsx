import Link from "next/link"

type Props = {
  scans: { id: string; name: string }[]
}

export const TableCellScans = ({ scans }: Props) => {
  const comps = scans.map((s) => (
    <Link
      key={s.id}
      href={`/scans/${s.id}`}
      className="underline underline-offset-4 transition-colors hover:text-foreground-400"
      target="_blank"
    >
      {s.name}
    </Link>
  ))

  return <div className="flex flex-wrap gap-2">{comps}</div>
}
