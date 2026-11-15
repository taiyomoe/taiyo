import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import type { ListDetail } from "@/features/lists/api/lists"
import { ListTitleCardBody, listTitleCardStyles } from "@/features/lists/components/list-title-card"

export function ListItemCard({
  item,
  position,
}: {
  item: ListDetail["items"][number]
  position: number
}) {
  return (
    <li>
      <Link
        params={{ mediaId: item.mediaId }}
        to="/media/$mediaId"
        {...stylex.props(listTitleCardStyles.card)}
      >
        <ListTitleCardBody position={position} title={item} />
      </Link>
    </li>
  )
}
