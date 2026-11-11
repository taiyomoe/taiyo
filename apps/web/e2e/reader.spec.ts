import { type APIRequestContext, type Page, expect, test } from "@playwright/test"
import { z } from "zod"

const API = `http://localhost:${process.env.API_PORT ?? "3002"}`
const MANGA = {
  mediaId: "11616192-2351-4e1e-8d70-3bf7908b796c",
  title: "Hako Girl",
  chapters: [
    "2a512ed1-dee2-4742-b0c1-f5979ad6b289",
    "52ccd5da-d120-4be6-ac0a-2153bd892ce8",
    "4fe2e5ae-37eb-4202-afcb-20084db1cde5",
    "3316faa8-7c5d-4457-8dc5-cad8f69f6de2",
    "f0070cf8-a819-40b0-bb81-caa39990fe60",
  ],
}
const MANHWA = {
  mediaId: "6c38ee07-cab3-4cec-a6d2-75276fd156ab",
  chapters: ["88c928d4-d135-442f-892c-5039026ee7ee", "aad9fa5c-852c-4405-93ea-b6483d3c698d"],
}
const SIGNED_OUT = { cookies: [], origins: [] }
const [FIRST, SECOND] = MANGA.chapters
const waitForHydration = async (page: Page, selector: string, timeout = 0) => {
  await page.waitForFunction(
    (root) =>
      Object.keys(document.querySelector(root) ?? {}).some((key) => key.startsWith("__react")),
    selector,
    { timeout },
  )
}
const openReader = async (page: Page, chapterId = FIRST, search = "") => {
  await page.goto(`/chapters/${chapterId}${search}`)
  await waitForHydration(page, "main")
}
const openTitle = async (page: Page) => {
  await page.goto(`/media/${MANGA.mediaId}`)
  await waitForHydration(page, "header")
}
const pageImage = (page: Page, number: number) =>
  page.getByRole("img", { name: `Page ${number}`, exact: true })
const naturalWidth = async (page: Page, number: number) =>
  pageImage(page, number).evaluate((image: HTMLImageElement) => image.naturalWidth)
const stageContent = (page: Page) => page.locator("main > div").first()
const clickSide = async (page: Page, side: "left" | "right") => {
  const { width, height } = page.viewportSize() ?? { width: 1440, height: 900 }

  await page.mouse.click(side === "left" ? 60 : width - 60, height / 2)
}
const sheet = (page: Page) => page.getByRole("dialog", { name: "Reader", exact: true })
const openSheet = async (page: Page) => {
  await page.keyboard.press("m")
  await expect(sheet(page)).toBeVisible()
}
const toolbarButton = async (page: Page, name: string) => {
  await page.mouse.move(400, 300)
  await page.mouse.move(420, 320)

  return page.getByRole("button", { name, exact: true })
}
const pagesSchema = z.object({ pages: z.array(z.object({ id: z.string(), url: z.string() })) })
const apiData = async (request: APIRequestContext, path: string) =>
  z.object({ data: z.unknown() }).parse(await (await request.get(`${API}${path}`)).json()).data

test.describe("reader, signed out", () => {
  test.use({ storageState: SIGNED_OUT })

  test("turns pages with the keyboard and the click zones", async ({ page }) => {
    await openReader(page)
    await expect(pageImage(page, 1)).toBeVisible()

    await page.keyboard.press("ArrowRight")

    await expect(page).toHaveURL(/page=2/)
    await expect(pageImage(page, 2)).toBeVisible()

    await clickSide(page, "right")

    await expect(page).toHaveURL(/page=3/)

    await clickSide(page, "left")

    await expect(page).toHaveURL(/page=2/)
  })

  test("asks before moving on from the last page", async ({ page }) => {
    await openReader(page, FIRST, "?page=9")
    await expect(pageImage(page, 9)).toBeVisible()

    await page.keyboard.press("ArrowRight")

    const dialog = page.getByRole("dialog")

    await expect(dialog).toContainText("Continue to Ch. 2?")

    await dialog.getByRole("button", { name: "Next chapter" }).click()

    await expect(page).toHaveURL(new RegExp(`/chapters/${SECOND}`))
    await expect(pageImage(page, 1)).toBeVisible()
  })

  test("opens manhwa as a long strip and keeps reading into the next chapter", async ({ page }) => {
    await openReader(page, MANHWA.chapters[0])
    // The strip appends the next chapter as soon as it loads, and its pages
    // carry the same names, so these look at the first chapter only.
    await expect(pageImage(page, 1).first()).toBeVisible()
    await expect(pageImage(page, 3).first()).toBeAttached()

    const divider = page.getByText("End of Ch. 1", { exact: true })

    await expect(divider).toBeAttached()

    for (let attempt = 0; attempt < 30; attempt++) {
      if (page.url().includes(MANHWA.chapters[1] ?? "")) {
        break
      }

      await page.mouse.wheel(0, 1500)
      await page.waitForTimeout(200)
    }

    await expect(page).toHaveURL(new RegExp(`/chapters/${MANHWA.chapters[1]}`))
  })

  test("zooms with the keyboard and only turns pages at 1x", async ({ page }) => {
    await openReader(page)
    await expect(pageImage(page, 1)).toBeVisible()

    await page.keyboard.press("+")

    await expect(stageContent(page)).toHaveCSS("transform", /matrix\(1\.5/)

    await clickSide(page, "right")
    await page.keyboard.press("0")

    await expect(stageContent(page)).toHaveCSS("transform", "none")
    await expect(page).not.toHaveURL(/page=/)

    await page.keyboard.press("ArrowRight")

    await expect(page).toHaveURL(/page=2/)
  })

  test("preloads the first page image in the server HTML", async ({ page }) => {
    const chapter = pagesSchema.parse(await apiData(page.request, `/chapters/${FIRST}`))
    const html = await (await page.request.get(`/chapters/${FIRST}?page=3`)).text()

    expect(html).toContain(`<link rel="preload" as="image" href="${chapter.pages[2]?.url}"`)
  })
})

test.describe("reader on a touch screen", () => {
  test.use({ storageState: SIGNED_OUT, hasTouch: true, viewport: { width: 420, height: 860 } })

  const touch = async (page: Page) => {
    const session = await page.context().newCDPSession(page)

    return async (
      type: "touchStart" | "touchMove" | "touchEnd",
      points: ReadonlyArray<{ x: number; y: number }>,
    ) => {
      await session.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: points.map((point, id) => ({ ...point, id })),
      })
    }
  }

  test("double-tap zooms in and out, a single tap still turns the page", async ({ page }) => {
    await openReader(page)
    await expect(pageImage(page, 1)).toBeVisible()

    const doubleTap = async (x: number, y: number) => {
      await page.evaluate(
        ([clientX, clientY]) => {
          const target = document.elementFromPoint(clientX, clientY)

          for (let tap = 0; tap < 2; tap++) {
            const init = { bubbles: true, cancelable: true, clientX, clientY }

            target?.dispatchEvent(
              new PointerEvent("pointerdown", { ...init, pointerType: "touch", isPrimary: true }),
            )
            target?.dispatchEvent(
              new PointerEvent("pointerup", { ...init, pointerType: "touch", isPrimary: true }),
            )
            target?.dispatchEvent(new MouseEvent("click", init))
          }
        },
        [x, y] as const,
      )
    }

    await doubleTap(210, 430)

    await expect(stageContent(page)).toHaveCSS("transform", /matrix\(2\.5/)
    await expect(page).not.toHaveURL(/page=/)

    await doubleTap(210, 430)

    await expect(stageContent(page)).toHaveCSS("transform", "none")

    await page.touchscreen.tap(390, 430)

    await expect(page).toHaveURL(/page=2/)
  })

  test("pinches to zoom", async ({ page }) => {
    await openReader(page)
    await expect(pageImage(page, 1)).toBeVisible()

    const send = await touch(page)

    await send("touchStart", [
      { x: 150, y: 430 },
      { x: 270, y: 430 },
    ])
    await send("touchMove", [
      { x: 120, y: 430 },
      { x: 300, y: 430 },
    ])
    await send("touchMove", [
      { x: 90, y: 430 },
      { x: 330, y: 430 },
    ])
    await send("touchEnd", [])

    await expect(stageContent(page)).toHaveCSS("transform", /matrix\(2,/)
    await expect(page).not.toHaveURL(/page=/)
  })
})

test.describe("reader, signed in", () => {
  test.describe.configure({ mode: "serial" })

  test.beforeEach(async ({ page }) => {
    await page.request.put(`${API}/users/me/reader-settings`, { data: {} })

    for (const chapterId of MANGA.chapters) {
      await page.request.delete(`${API}/chapters/${chapterId}/read`)
    }

    const bookmarks = z
      .array(z.object({ chapterId: z.string(), pageId: z.string() }))
      .parse(await apiData(page.request, `/users/me/bookmarks?mediaId=${MANGA.mediaId}`))

    for (const bookmark of bookmarks) {
      await page.request.delete(
        `${API}/chapters/${bookmark.chapterId}/bookmarks/${bookmark.pageId}`,
      )
    }
  })

  test("resumes from the title page where the reader left off", async ({ page }) => {
    const chapter = pagesSchema.parse(await apiData(page.request, `/chapters/${FIRST}`))
    const thirdPage = chapter.pages[2]?.id ?? "missing"

    await page.request.delete(`${API}/users/me/history/${FIRST}`)
    await openReader(page)
    await expect(pageImage(page, 1)).toBeVisible()

    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/chapters/${FIRST}/history`) &&
        response.request().method() === "PATCH" &&
        (response.request().postData() ?? "").includes(thirdPage),
    )

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/page=3/)
    await saved

    await openTitle(page)

    const resume = page.getByRole("link", { name: "Resume Ch. 1 · p. 3" })

    await expect(resume).toBeVisible()

    await resume.click()

    await expect(page).toHaveURL(new RegExp(`/chapters/${FIRST}\\?page=3`))
  })

  test("marks single chapters and every chapter as read from the title page", async ({ page }) => {
    await openTitle(page)

    const row = page.getByRole("listitem").filter({ hasText: "Ch. 2" })

    await row.getByRole("button", { name: "Mark as read" }).click()
    await expect(row.getByRole("button", { name: "Mark as unread" })).toBeVisible()

    await openTitle(page)
    await expect(row.getByRole("button", { name: "Mark as unread" })).toBeVisible()

    await row.getByRole("button", { name: "Mark as unread" }).click()
    await expect(row.getByRole("button", { name: "Mark as read" })).toBeVisible()

    await page.getByRole("button", { name: "Mark all as read" }).click()
    await page.getByRole("alertdialog").getByRole("button", { name: "Mark all as read" }).click()

    await expect(page.getByRole("button", { name: "Mark as unread" })).toHaveCount(
      MANGA.chapters.length,
    )
    await expect(page.getByRole("button", { name: "Mark as read" })).toHaveCount(0)
  })

  test("bookmarks a page and jumps back to it from the menu", async ({ page }) => {
    await openReader(page, FIRST, "?page=2")
    await expect(pageImage(page, 2)).toBeVisible()

    await page.keyboard.press("b")

    await expect(await toolbarButton(page, "Remove bookmark")).toBeVisible()

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/page=4/)

    await openSheet(page)
    await sheet(page).getByRole("button", { name: "Ch. 1 · p. 2" }).click()

    await expect(page).toHaveURL(/page=2/)

    await openSheet(page)
    await sheet(page).getByRole("button", { name: "Remove bookmark" }).click()

    await expect(sheet(page).getByText("No bookmarks in this title yet.")).toBeVisible()
  })

  test("reports a page, and a reviewer resolves it from the dashboard", async ({ page }) => {
    const reports = z
      .array(z.object({ id: z.string(), chapter: z.object({ id: z.string() }) }))
      .parse(await apiData(page.request, "/chapters/page-reports?perPage=100"))

    for (const report of reports) {
      if (report.chapter.id === FIRST) {
        await page.request.patch(`${API}/chapters/page-reports/${report.id}`, {
          data: { status: "DISMISSED" },
        })
      }
    }

    await openReader(page, FIRST, "?page=3")
    await expect(pageImage(page, 3)).toBeVisible()
    await (await toolbarButton(page, "Report this page")).click()

    const dialog = page.getByRole("dialog", { name: "Report a problem with this page" })

    await dialog.getByText("The pages are in the wrong order").click()
    await dialog.getByRole("textbox").fill("Page 3 should come after page 4")
    await dialog.getByRole("button", { name: "Send report" }).click()

    await expect(page.getByText("Thanks! The report was sent.")).toBeVisible()

    await page.goto("/dashboard/page-reports")
    await waitForHydration(page, "header")

    const row = page
      .getByRole("listitem")
      .filter({ hasText: `${MANGA.title} · Ch. 1 · p. 3` })
      .filter({ hasText: "Page 3 should come after page 4" })

    await expect(row).toContainText("The pages are in the wrong order")

    await row.getByRole("button", { name: "Resolved" }).click()

    await expect(row).toHaveCount(0)
  })

  test("keeps reader settings on the account across devices", async ({ page }) => {
    await openReader(page, FIRST, "?page=2")
    await expect(pageImage(page, 2)).toBeVisible()
    await openSheet(page)

    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/users/me/reader-settings") &&
        response.request().method() === "PUT",
    )

    await sheet(page).getByRole("radio", { name: "Double" }).click()
    await saved
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()

    await expect(pageImage(page, 2)).toBeVisible()
    await expect(pageImage(page, 3)).toBeVisible()

    await page.request.put(`${API}/users/me/reader-settings`, { data: {} })
  })

  test("downloads a chapter and reads it without a connection", async ({ page, context }) => {
    test.setTimeout(180_000)
    await openReader(page, SECOND)
    await expect(pageImage(page, 1)).toBeVisible()
    await openSheet(page)

    const offline = sheet(page)

    await offline.getByRole("button", { name: "Download" }).click()
    await expect(offline.getByText("Available offline")).toBeVisible({ timeout: 60_000 })

    await page.reload()
    await waitForHydration(page, "main")
    await expect(pageImage(page, 1)).toBeVisible()

    await context.setOffline(true)
    await page.reload()
    await waitForHydration(page, "main")

    await expect(pageImage(page, 1)).toBeVisible()
    await expect.poll(() => naturalWidth(page, 1)).toBeGreaterThan(0)

    await context.setOffline(false)
    await openSheet(page)
    await sheet(page).getByRole("button", { name: "Remove" }).click()

    await expect(sheet(page).getByText("Not downloaded")).toBeVisible()
  })
})
