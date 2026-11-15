import * as stylex from "@stylexjs/stylex"
import { Copy, Download } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  codes: {
    margin: 0,
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    listStyle: "none",
    backgroundColor: colors.muted,
    columnGap: "1.5rem",
    display: "grid",
    fontFamily: font.mono,
    fontSize: "0.9375rem",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.sm]: "repeat(3, minmax(0, 1fr))",
    },
    letterSpacing: "0.04em",
    rowGap: "0.5rem",
  },
  buttons: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})

export function BackupCodes({ codes }: { codes: string[] }) {
  const text = codes.join("\n")

  return (
    <div sx={styles.root}>
      <ul aria-label={m.user_settings_2fa_backup_codes()} sx={styles.codes}>
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div sx={styles.buttons}>
        <Button
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => {
              toastManager.add({ title: m.user_settings_2fa_codes_copied(), type: "success" })
            })
          }}
          size="sm"
          variant="outline"
        >
          <Copy />
          {m.user_settings_2fa_copy_codes()}
        </Button>
        <Button
          onClick={() => {
            const link = document.createElement("a")

            link.href = URL.createObjectURL(new Blob([`${text}\n`], { type: "text/plain" }))
            link.download = "taiyo-backup-codes.txt"
            link.click()
            URL.revokeObjectURL(link.href)
          }}
          size="sm"
          variant="outline"
        >
          <Download />
          {m.user_settings_2fa_download_codes()}
        </Button>
      </div>
    </div>
  )
}
