import * as stylex from "@stylexjs/stylex"
import { ExternalLink, Link as LinkIcon } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  proof: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  proofTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  proofList: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  proofLink: {
    gap: "0.5rem",
    alignItems: "center",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "inline-flex",
    fontSize: "0.9375rem",
    overflowWrap: "anywhere",
  },
  proofIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
})

export function ProofLinks({ links }: { links: readonly string[] }) {
  return (
    <div sx={styles.proof}>
      <p sx={styles.proofTitle}>{m.review_proof()}</p>
      <ul sx={styles.proofList}>
        {links
          .filter((link) => /^https?:\/\//.test(link))
          .map((link) => (
            <li key={link}>
              <a
                href={link}
                rel="noopener noreferrer nofollow"
                sx={styles.proofLink}
                target="_blank"
              >
                <LinkIcon size={16} {...stylex.props(styles.proofIcon)} />
                {link}
                <ExternalLink size={14} {...stylex.props(styles.proofIcon)} />
              </a>
            </li>
          ))}
      </ul>
    </div>
  )
}
