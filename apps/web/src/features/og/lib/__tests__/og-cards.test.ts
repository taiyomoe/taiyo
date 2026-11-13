import { Renderer } from "@takumi-rs/core"
import { once } from "node:events"
import { mkdir, writeFile } from "node:fs/promises"
import { createServer, type Server } from "node:http"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, test } from "vitest"
import {
  chapterOgCard,
  groupOgCard,
  listOgCard,
  mediaOgCard,
  type OgCard,
  userOgCard,
} from "@/features/og/lib/og-cards"
import { measureOgText, renderOgImage, type TextBox } from "@/features/og/lib/og-renderer"
import { OG_HEIGHT, OG_WIDTH } from "@/features/og/lib/og-theme"
import {
  chapter,
  group,
  LONG_TEXT,
  LONG_TITLE,
  list,
  media,
  readerEntry,
  titled,
  UNBROKEN,
  user,
} from "./og-fixtures"

const HOST = "example.org"
const HUES = ["#2d6cdf", "#16a34a", "#c026d3", "#ea580c", "#0891b2"]
let server: Server
let images = ""
/** Pictures drawn on the fly, so the cards load real images over HTTP. */
const picture = async (width: number, height: number, hue: string, label: string) =>
  new Renderer().render(
    {
      type: "container",
      style: {
        display: "flex",
        alignItems: "flex-end",
        width,
        height,
        padding: 24,
        backgroundImage: `linear-gradient(160deg, ${hue}, #111 85%)`,
        color: "white",
        fontSize: Math.round(width / 9),
        fontWeight: 700,
      },
      children: [{ type: "text", text: label }],
    },
    { width, height, format: "jpeg" },
  )
const cases: Record<string, () => Promise<OgCard>> = {
  "media-basic": async () => mediaOgCard(media(images), HOST),
  "media-long-title": async () => mediaOgCard(titled(images, LONG_TITLE), HOST),
  "media-very-long-title": async () =>
    mediaOgCard(titled(images, `${LONG_TITLE} ${LONG_TITLE}`), HOST),
  "media-unbroken-title": async () => mediaOgCard(titled(images, UNBROKEN), HOST),
  "media-japanese-title": async () =>
    mediaOgCard(
      titled(images, "転生したら剣でした〜最強の魔剣に転生した俺は、猫耳少女と世界を旅する〜", {
        type: "LIGHT_NOVEL",
        demography: "SHOUNEN",
      }),
      HOST,
    ),
  "media-korean-arabic-emoji": async () =>
    mediaOgCard(titled(images, "나 혼자만 레벨업 🔥 المملكة ✨"), HOST),
  "media-no-cover-no-tags": async () =>
    mediaOgCard(
      media(images, { covers: [], tags: null, startDate: null, status: "NOT_YET_RELEASED" }),
      HOST,
    ),
  "media-broken-cover": async () =>
    mediaOgCard(
      media(images, {
        covers: [
          {
            id: "x",
            url: `${images}/not-an-image.jpg`,
            volume: null,
            language: "en",
            contentRating: "NORMAL",
            isMainCover: true,
          },
        ],
      }),
      HOST,
    ),
  "media-corrupt-cover": async () =>
    mediaOgCard(
      media(images, {
        covers: [
          {
            id: "x",
            url: `${images}/corrupt.jpg`,
            volume: null,
            language: "en",
            contentRating: "NORMAL",
            isMainCover: true,
          },
        ],
      }),
      HOST,
    ),
  "media-nsfw": async () => mediaOgCard(media(images, { contentRating: "NSFW" }), HOST),
  "chapter-basic": async () =>
    chapterOgCard({ chapter: chapter(), media: media(images), entry: readerEntry() }, HOST),
  "chapter-extreme": async () =>
    chapterOgCard(
      {
        chapter: chapter({ number: 1234.5, volume: "123", title: LONG_TITLE, language: "es_la" }),
        media: titled(images, LONG_TITLE),
        entry: readerEntry({
          pageCount: 1,
          groups: [
            { id: "1", name: "An Extremely Long Scanlation Group Name That Never Ends" },
            { id: "2", name: "Second Team" },
            { id: "3", name: "Third" },
            { id: "4", name: "Fourth" },
          ],
        }),
      },
      HOST,
    ),
  "chapter-long-volume": async () =>
    chapterOgCard(
      {
        chapter: chapter({ volume: "Special Edition Extra Volume 12", language: "es_la" }),
        media: media(images),
        entry: readerEntry({ pageCount: 1234 }),
      },
      HOST,
    ),
  "chapter-untitled-no-entry": async () =>
    chapterOgCard(
      {
        chapter: chapter({ title: null, volume: null, language: "ja_ro" }),
        media: media(images, { covers: [] }),
        entry: undefined,
      },
      HOST,
    ),
  "user-basic": async () => userOgCard(user(images), HOST),
  "user-staff-no-images": async () =>
    userOgCard(
      user(images, { role: "ADMIN", image: null, bannerUrl: null, about: {}, followerCount: 1 }),
      HOST,
    ),
  "user-extreme": async () =>
    userOgCard(
      user(images, {
        displayUsername: "ＭａｘｉｍｕｍＬｅｎｇｔｈＵｓｅｒｎａｍｅ✨🌸",
        username: "maximum.length.username.for.real",
        role: "UPLOADER_INTERN",
        followerCount: 1_234_567,
        uploadCount: 98_765,
        listCount: 1,
        about: { en: LONG_TEXT },
      }),
      HOST,
    ),
  "user-rtl": async () =>
    userOgCard(
      user(images, { displayUsername: "محمد الأمين", image: `${images}/missing.jpg` }),
      HOST,
    ),
  "group-basic": async () => groupOgCard(group(images), HOST),
  "group-extreme": async () =>
    groupOgCard(
      group(images, {
        name: `${LONG_TITLE} Scans`,
        logo: "",
        languages: ["pt_br", "en", "es_la", "fr", "ja", "ko", "zh", "ar"],
        chapterCount: 123_456,
        mediaCount: 9_999,
        memberCount: 0,
        followerCount: 54_321,
        description: LONG_TEXT,
      }),
      HOST,
    ),
  "list-basic": async () => listOgCard(list(images, 24), HOST),
  "list-two": async () => listOgCard(list(images, 2), HOST),
  "list-empty": async () => listOgCard(list(images, 0, { description: null }), HOST),
  "list-extreme": async () =>
    listOgCard(
      list(images, 12_345, {
        name: LONG_TITLE,
        description: LONG_TEXT,
        owner: {
          id: "x",
          username: "x",
          displayUsername: "SomeoneWithAnIncrediblyLongDisplayNameHere",
          image: null,
          nameEffect: null,
          avatarBorder: null,
        },
      }),
      HOST,
    ),
}
// Where each card's text column ends: the cover, the fanned covers or the
// card's edge begin past it.
const TEXT_LIMITS: Record<string, number> = {
  media: 806,
  chapter: 806,
  list: 600,
  user: OG_WIDTH - 64,
  group: OG_WIDTH - 64,
}
// A line's box spans the font's whole ascent and descent, more than the line
// height; its middle is where the letters' ink is.
const ink = (box: TextBox) => {
  const inset = (box.bottom - box.top) * 0.28

  return { ...box, top: box.top + inset, bottom: box.bottom - inset }
}
const overlaps = (a: TextBox, b: TextBox) =>
  a.block !== b.block &&
  ink(a).left < ink(b).right - 1 &&
  ink(b).left < ink(a).right - 1 &&
  ink(a).top < ink(b).bottom &&
  ink(b).top < ink(a).bottom
const collisions = (boxes: TextBox[]) =>
  boxes.flatMap((box, index) =>
    boxes
      .slice(index + 1)
      .filter((other) => overlaps(box, other))
      .map((other) => `${box.text} / ${other.text}`),
  )

describe("og cards", () => {
  beforeAll(async () => {
    const files = new Map<string, Uint8Array>([
      ["/cover.jpg", await picture(600, 900, HUES[0] ?? "", "COVER")],
      ["/banner.jpg", await picture(1500, 500, HUES[2] ?? "", "BANNER")],
      ["/avatar.jpg", await picture(400, 400, HUES[1] ?? "", "AV")],
      ["/logo.jpg", await picture(400, 400, HUES[3] ?? "", "LOGO")],
      ...(await Promise.all(
        HUES.map(
          async (hue, index) =>
            [`/cover-${index}.jpg`, await picture(400, 600, hue, `#${index + 1}`)] as const,
        ),
      )),
      ["/not-an-image.jpg", new TextEncoder().encode("<html>nope</html>")],
      ["/corrupt.jpg", new TextEncoder().encode("definitely not a jpeg")],
    ])

    server = createServer((request, response) => {
      const file = files.get(request.url ?? "")

      if (file === undefined) {
        response.writeHead(404).end()

        return
      }

      response
        .writeHead(200, {
          "content-type": request.url === "/not-an-image.jpg" ? "text/html" : "image/jpeg",
        })
        .end(file)
    })
    server.listen(0, "127.0.0.1")
    await once(server, "listening")

    const address = server.address()

    if (address === null || typeof address === "string") {
      throw new Error("The image server did not get a port.")
    }

    images = `http://127.0.0.1:${address.port}`
  })

  afterAll(() => {
    server.close()
  })

  test.each(Object.keys(cases))("%s lays its text out without overflow", async (name) => {
    const card = await cases[name]?.()
    const boxes = await measureOgText(card?.element, card?.images)
    const limit = TEXT_LIMITS[name.split("-")[0] ?? ""] ?? OG_WIDTH

    expect(boxes.length).toBeGreaterThan(0)
    expect(
      boxes
        .filter(
          (box) => box.left < 0 || box.top < 0 || box.right > OG_WIDTH || box.bottom > OG_HEIGHT,
        )
        .map((box) => box.text),
      "text leaves the card",
    ).toEqual([])
    expect(
      boxes.filter((box) => box.left < limit && box.right > limit).map((box) => box.text),
      "text runs into the picture",
    ).toEqual([])
    expect(collisions(boxes), "text overlaps other text").toEqual([])
  })

  test.each(Object.keys(cases))("%s renders", async (name) => {
    const card = await cases[name]?.()

    expect(card).toBeDefined()

    const jpeg = await renderOgImage(card?.element, card?.images)

    expect([...jpeg.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff])

    // OG_PREVIEW_DIR=/some/dir saves every card to look at by eye.
    if (process.env.OG_PREVIEW_DIR !== undefined) {
      await mkdir(process.env.OG_PREVIEW_DIR, { recursive: true })
      await writeFile(path.join(process.env.OG_PREVIEW_DIR, `${name}.jpg`), jpeg)
    }
  })
})
