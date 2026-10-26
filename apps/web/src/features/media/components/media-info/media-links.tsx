import * as stylex from "@stylexjs/stylex"
import { ArrowRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { getMediaLinks } from "@/features/media/lib/media-labels"

const styles = stylex.create({
  links: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})

type MediaLinksProps = {
  links: ReturnType<typeof getMediaLinks>
}

export function MediaLinks({ links }: MediaLinksProps) {
  return (
    <div sx={styles.links}>
      {links.map((link) => (
        <Button
          key={link.key}
          render={<a href={link.href} rel="noreferrer noopener" target="_blank" />}
          size="sm"
          variant="outline"
        >
          {link.label}
          <ArrowRight />
        </Button>
      ))}
    </div>
  )
}
