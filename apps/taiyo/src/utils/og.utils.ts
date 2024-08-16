import { parallel } from "radash"

const fetchFont = async (name: string) =>
  fetch(`https://fonts.cdnfonts.com/s/19795/${name}`).then((r) =>
    r.arrayBuffer(),
  )

const getFonts = async () => {
  const fonts = await parallel(
    10,
    [
      "Inter-Regular.woff",
      "Inter-Medium.woff",
      "Inter-Bold.woff",
      "Inter-SemiBold.woff",
      "Inter-ExtraBold.woff",
    ],
    (name) => fetchFont(name),
  )

  return [
    {
      name: "Inter",
      data: fonts.at(0)!,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Inter",
      data: fonts.at(1)!,
      style: "normal" as const,
      weight: 500 as const,
    },
    {
      name: "Inter",
      data: fonts.at(2)!,
      style: "normal" as const,
      weight: 600 as const,
    },
    {
      name: "Inter",
      data: fonts.at(3)!,
      style: "normal" as const,
      weight: 700 as const,
    },
    {
      name: "Inter",
      data: fonts.at(4)!,
      style: "normal" as const,
      weight: 800 as const,
    },
  ]
}

export const OGUtils = {
  getFonts,
}
