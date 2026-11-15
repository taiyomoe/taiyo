import type { FontDetails } from "@takumi-rs/core"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { entries, flatMap, map, pipe } from "remeda"
import { z } from "zod"
import { OG_FONT_FAMILIES, type OgFontFamily } from "@/features/og/lib/og-theme"

const packageDir = (resolved: string) => path.dirname(fileURLToPath(resolved))
const noto = (script: string, resolved: string) => ({
  dir: packageDir(resolved),
  file: (subset: string) =>
    `noto-sans-${script}-${subset.replace(/^\[(\d+)\]$/, "$1")}-wght-normal.woff2`,
})
// The files of each family, from the same @fontsource packages the site ships.
const FILES: Record<
  OgFontFamily,
  { dir: string; file: (subset: string) => string; weight?: number }
> = {
  "PT Serif": {
    dir: packageDir(import.meta.resolve("@fontsource/pt-serif/package.json")),
    file: (subset) => `pt-serif-${subset}-700-normal.woff2`,
    weight: 700,
  },
  Inter: {
    dir: packageDir(import.meta.resolve("@fontsource-variable/inter/package.json")),
    file: (subset) => `inter-${subset}-wght-normal.woff2`,
  },
  "Noto Sans JP": noto("jp", import.meta.resolve("@fontsource-variable/noto-sans-jp/package.json")),
  "Noto Sans KR": noto("kr", import.meta.resolve("@fontsource-variable/noto-sans-kr/package.json")),
  "Noto Sans SC": noto("sc", import.meta.resolve("@fontsource-variable/noto-sans-sc/package.json")),
  "Noto Sans Arabic": noto(
    "arabic",
    import.meta.resolve("@fontsource-variable/noto-sans-arabic/package.json"),
  ),
  "Noto Sans Hebrew": noto(
    "hebrew",
    import.meta.resolve("@fontsource-variable/noto-sans-hebrew/package.json"),
  ),
  "Noto Sans Thai": noto(
    "thai",
    import.meta.resolve("@fontsource-variable/noto-sans-thai/package.json"),
  ),
}
const parseRanges = (ranges: string) =>
  ranges.split(",").map((range): [number, number] => {
    const [start = "0", end = start] = range.trim().replace(/^U\+/i, "").split("-")

    return [Number.parseInt(start, 16), Number.parseInt(end, 16)]
  })
const loadFamily = async (name: OgFontFamily) => {
  const { dir, file, weight } = FILES[name]
  const subsets = z
    .record(z.string(), z.string())
    .parse(JSON.parse(await readFile(path.join(dir, "unicode.json"), "utf8")))

  return Promise.all(
    pipe(
      entries(subsets),
      map(async ([subset, ranges]): Promise<FontDetails> => ({
        name,
        ...(weight === undefined ? {} : { weight }),
        data: await readFile(path.join(dir, "files", file(subset))),
        unicodeRange: parseRanges(ranges),
      })),
    ),
  )
}

export const loadOgFonts = async () =>
  pipe(
    await Promise.all(OG_FONT_FAMILIES.map(loadFamily)),
    flatMap((fonts) => fonts),
  )
