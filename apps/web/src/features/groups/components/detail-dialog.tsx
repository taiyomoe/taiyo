import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { ExternalLink, Link as LinkIcon } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useRef } from "react"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  title: {
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  body: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  section: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  heading: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  quote: {
    margin: 0,
    borderRadius: radius.lg,
    paddingBlock: "0.875rem",
    paddingInline: "1rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 4%, transparent)`,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  links: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  link: {
    gap: "0.5rem",
    alignItems: "flex-start",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "inline-flex",
    fontSize: "0.875rem",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  linkIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    marginTop: "0.125rem",
  },
})

/** A record shown in full: its title, a line of facts, then titled sections. */
export function DetailDialog({
  open,
  title,
  meta,
  footer,
  onClose,
  children,
}: {
  open: boolean
  title: ReactNode
  meta: ReactNode
  footer?: ReactNode
  onClose: () => void
  children: ReactNode
}) {
  const close = useRef<HTMLButtonElement>(null)

  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
      open={open}
    >
      <DialogPopup initialFocus={close}>
        <DialogHeader>
          <DialogTitle sx={styles.title}>{title}</DialogTitle>
          <DialogDescription render={<div />} sx={styles.meta}>
            {meta}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div sx={styles.body}>{children}</div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose ref={close} render={<Button variant="outline" />}>
            {m.group_details_close()}
          </DialogClose>
          {footer}
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section sx={styles.section}>
      <h3 sx={styles.heading}>{title}</h3>
      {children}
    </section>
  )
}

/** Text someone wrote, kept with its line breaks. */
export function DetailQuote({ children }: { children: ReactNode }) {
  return <p sx={styles.quote}>{children}</p>
}

export function ProofLinkList({ links }: { links: readonly string[] }) {
  return (
    <ul sx={styles.links}>
      {links
        .filter((link) => /^https?:\/\//.test(link))
        .map((link) => (
          <li key={link}>
            <a href={link} rel="noopener noreferrer nofollow" sx={styles.link} target="_blank">
              <LinkIcon size={16} {...stylex.props(styles.linkIcon)} />
              {link}
              <ExternalLink size={14} {...stylex.props(styles.linkIcon)} />
            </a>
          </li>
        ))}
    </ul>
  )
}
