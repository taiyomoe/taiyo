import type { ReactNode } from "react"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { statsStyles } from "@/features/users/components/profile/tabs/stats-styles"

export function StatsCard({
  title,
  note,
  flush = false,
  children,
}: {
  title: string
  note?: string
  flush?: boolean
  children: ReactNode
}) {
  return (
    <section sx={[profileStyles.card, flush && profileStyles.flush, statsStyles.cardBody]}>
      <div sx={statsStyles.cardHead}>
        <h3 sx={profileStyles.sectionTitle}>{title}</h3>
        {note === undefined ? null : <span sx={statsStyles.cardNote}>{note}</span>}
      </div>
      {children}
    </section>
  )
}
