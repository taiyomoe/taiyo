import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useState } from "react"

// One lazy chunk per flag, so a profile only downloads the flag it shows.
const FLAGS = import.meta.glob<string>("/node_modules/country-flag-icons/3x2/*.svg", {
  query: "?url",
  import: "default",
})
const styles = stylex.create({
  flag: {
    borderRadius: radius.sm,
    boxShadow: "0 0 0 1px rgb(0 0 0 / 10%)",
    display: "inline-block",
    flexShrink: 0,
    objectFit: "cover",
    height: "0.875rem",
    width: "1.3125rem",
  },
})

export function LazyCountryFlag({ country, sx }: { country: string; sx?: Sx }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = FLAGS[`/node_modules/country-flag-icons/3x2/${country.toUpperCase()}.svg`]

    void load?.().then((url) => {
      if (!cancelled) {
        setSrc(url)
      }
    })

    return () => {
      cancelled = true
    }
  }, [country])

  return src === null ? (
    <span aria-hidden sx={[styles.flag, sx]} />
  ) : (
    <img alt="" aria-hidden decoding="async" src={src} sx={[styles.flag, sx]} />
  )
}
