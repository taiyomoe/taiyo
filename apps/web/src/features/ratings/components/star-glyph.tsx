import type { Sx } from "@taiyomoe/ui/styles/sx"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"

export function StarGlyph({ sx }: { sx?: Sx }) {
  return (
    <svg aria-hidden fill="currentColor" sx={sx} viewBox="0 0 24 24">
      <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96z" />
    </svg>
  )
}
