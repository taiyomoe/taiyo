/**
 * Renders the landing page's plasma sun into the static Open Graph media:
 *
 * - public/og/taiyo.mp4: the looping video shared on generic pages
 * - public/og/taiyo.jpg: its poster, also the default og:image
 * - src/features/og/assets/sun.webp: the sun alone, which the per-page cards compose
 *
 * The frames come from Chromium running the same shaders as the landing page
 * (stage.html), so the media always match the site. Run it after changing the
 * sun: `node scripts/og-media/render.ts` (`--preview` saves four frames only,
 * `--sun-only` renders the cut-out alone).
 * It needs ffmpeg with libx264, and a GPU: software WebGL takes minutes per frame.
 */
import { chromium } from "@playwright/test"
import * as shaders from "@taiyomoe/ui/utils/scene/shaders"
import { Renderer } from "@takumi-rs/core"
import { execFileSync } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

const FPS = 30
// The sun turns once per loop, so the loop also sets how fast it spins.
const LOOP_SECONDS = 24
const FADE_FRAMES = 45
const LOOP_FRAMES = FPS * LOOP_SECONDS
const ORIGIN = "http://og-stage.local"
const appDir = path.resolve(import.meta.dirname, "../..")
const run = (command: string, args: string[]) => {
  execFileSync(command, args, { stdio: "inherit" })
}
const log = (message: string) => {
  process.stdout.write(`${message}\n`)
}
const resolveFile = (specifier: string) => new URL(import.meta.resolve(specifier)).pathname
const files: Record<string, { path: string; type: string }> = {
  "/": { path: path.join(import.meta.dirname, "stage.html"), type: "text/html" },
  "/three.module.js": { path: resolveFile("three"), type: "text/javascript" },
  "/three.core.js": {
    path: path.join(path.dirname(resolveFile("three")), "three.core.js"),
    type: "text/javascript",
  },
  "/fonts/pt-serif-latin.woff2": {
    path: resolveFile("@fontsource/pt-serif/files/pt-serif-latin-700-normal.woff2"),
    type: "font/woff2",
  },
  "/fonts/pt-serif-latin-ext.woff2": {
    path: resolveFile("@fontsource/pt-serif/files/pt-serif-latin-ext-700-normal.woff2"),
    type: "font/woff2",
  },
  "/fonts/inter-latin.woff2": {
    path: resolveFile("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"),
    type: "font/woff2",
  },
}
const capture = async (
  config: Record<string, unknown>,
  frames: number[],
  outDir: string,
  { transparent = false } = {},
) => {
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
  })
  const page = await browser.newPage({ viewport: { width: 1600, height: 1600 } })
  const logoPath = /\sd="([^"]+)"/.exec(
    await readFile(path.join(appDir, "public/favicon.svg"), "utf8"),
  )?.[1]

  await page.route(`${ORIGIN}/**`, async (route) => {
    const { pathname } = new URL(route.request().url())

    if (pathname === "/config.json") {
      await route.fulfill({ json: { ...config, shaders, logoPath, pixelRatio: 1 } })

      return
    }

    const file = files[pathname]

    await (file === undefined
      ? route.fulfill({ status: 404 })
      : route.fulfill({ body: await readFile(file.path), contentType: file.type }))
  })
  await page.goto(`${ORIGIN}/`)
  await page.waitForFunction(() => "ready" in window)

  const stage = page.locator("#stage")

  for (const [index, frame] of frames.entries()) {
    await page.evaluate(`renderFrame(${frame / FPS})`)
    await stage.screenshot({
      path: path.join(outDir, `${String(index).padStart(4, "0")}.png`),
      omitBackground: transparent,
    })
  }

  await browser.close()
}
const sceneConfig = {
  title: "Read in the light.",
  loopSeconds: LOOP_SECONDS,
  timeScale: 1.6,
  breaths: 3,
  turns: 1,
  spin: 0,
  embers: 34,
}
const work = await mkdtemp(path.join(tmpdir(), "taiyo-og-"))
const raw = path.join(work, "raw")
const loop = path.join(work, "loop")
const sun = path.join(work, "sun")

await Promise.all([raw, loop, sun].map((dir) => mkdir(dir)))

if (process.argv.includes("--preview")) {
  await capture(
    {
      ...sceneConfig,
      mode: "video",
      sun: { x: 600, y: 700, radius: 330, extent: 3, size: 330 / 235 },
    },
    [0, 90, 180, 270],
    raw,
  )
  log(`Preview frames in ${raw}`)
  process.exit(0)
}

await mkdir(path.join(appDir, "public/og"), { recursive: true })
await mkdir(path.join(appDir, "src/features/og/assets"), { recursive: true })

const renderVideo = async () => {
  log(`Rendering ${LOOP_FRAMES + FADE_FRAMES} video frames…`)
  await capture(
    {
      ...sceneConfig,
      mode: "video",
      sun: { x: 600, y: 700, radius: 330, extent: 3, size: 330 / 235 },
    },
    Array.from({ length: LOOP_FRAMES + FADE_FRAMES }, (_, frame) => frame),
    raw,
  )

  // The plasma never repeats, so the loop's first frames fade in from the frames
  // right after its end: the last frame then flows into the first one.
  log("Blending the loop seam…")

  for (let frame = 0; frame < LOOP_FRAMES; frame++) {
    const name = (index: number) => path.join(raw, `${String(index).padStart(4, "0")}.png`)
    const out = path.join(loop, `${String(frame).padStart(4, "0")}.png`)

    if (frame >= FADE_FRAMES) {
      await writeFile(out, await readFile(name(frame)))

      continue
    }

    const weight = (frame / FADE_FRAMES).toFixed(4)

    run("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-i",
      name(LOOP_FRAMES + frame),
      "-i",
      name(frame),
      "-filter_complex",
      `[0][1]blend=all_expr='A*(1-${weight})+B*${weight}'`,
      out,
    ])
  }

  log("Encoding the video…")
  // H.264 in yuv420p with the index up front plays in every client that plays
  // video at all, and 24 s of it stays far below iMessage's 10 MB budget.
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-framerate",
    String(FPS),
    "-i",
    path.join(loop, "%04d.png"),
    "-c:v",
    "libx264",
    "-preset",
    "veryslow",
    "-crf",
    "21",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    path.join(appDir, "public/og/taiyo.mp4"),
  ])
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    path.join(loop, "0000.png"),
    "-q:v",
    "3",
    path.join(appDir, "public/og/taiyo.jpg"),
  ])
}

// `--sun-only` skips the video, which takes several minutes.
if (!process.argv.includes("--sun-only")) {
  await renderVideo()
}

log("Rendering the sun cut-out…")
await capture(
  // The cards draw the sun small, so its beams reach further than on the
  // landing page: five radii instead of three, as long as a small sun's.
  {
    ...sceneConfig,
    mode: "sun",
    embers: 0,
    sun: { x: 800, y: 800, radius: 160, extent: 5, size: 0.4 },
  },
  [Math.round(FPS * 4.2)],
  sun,
  { transparent: true },
)
await writeFile(
  path.join(appDir, "src/features/og/assets/sun.webp"),
  await new Renderer().render(
    { type: "image", src: await readFile(path.join(sun, "0000.png")), width: 1600, height: 1600 },
    { width: 1600, height: 1600, format: "webp", quality: 88 },
  ),
)
await rm(work, { recursive: true })
log("Done.")
