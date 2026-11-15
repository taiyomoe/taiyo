import { defineCommand } from "citty"
import { config as loadEnv } from "dotenv"
import { existsSync } from "node:fs"
import { mkdir, rename, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { forEachConcurrently } from "./concurrency.ts"
import { repoRoot } from "./env-file.ts"

const DOWNLOAD_ATTEMPTS = 6

export default defineCommand({
  meta: {
    name: "download-sample-images",
    description:
      "Download every cover, banner and chapter page of the seed sample from the production bucket into a folder laid out like the bucket.",
  },
  args: {
    out: {
      type: "string",
      description: "Output folder, relative to the repository root.",
      default: "output/sample-images",
    },
    envFile: {
      type: "string",
      description: "Path to the env file with production credentials.",
      default: ".env.prod",
    },
    concurrency: {
      type: "string",
      description: "Parallel downloads.",
      default: "32",
    },
  },
  run: async ({ args }) => {
    const envPath = resolve(process.cwd(), args.envFile)
    const result = loadEnv({ path: envPath, override: true })

    if (result.error) {
      console.error(`Failed to load env file at ${envPath}: ${result.error.message}`)
      process.exit(1)
    }

    const {
      GetObjectCommand,
      getBannerKey,
      getChapterPageKey,
      getCoverKey,
      getS3Bucket,
      getS3Client,
    } = await import("@taiyomoe/s3")
    const { readSampleRows } = await import("@taiyomoe/db/sample")
    const s3 = getS3Client()
    const bucket = getS3Bucket()
    const out = resolve(repoRoot, args.out)
    const covers = await readSampleRows("covers")
    const banners = await readSampleRows("banners")
    const chapters = await readSampleRows("chapters")
    const keys = [
      ...covers.map((cover) => getCoverKey(cover.mediaId, `${cover.id}.${cover.extension}`)),
      ...banners.map((banner) => getBannerKey(banner.mediaId, `${banner.id}.${banner.extension}`)),
      ...chapters.flatMap((chapter) =>
        (chapter.pages ?? []).map((page) =>
          getChapterPageKey(chapter.mediaId, chapter.id, page.id),
        ),
      ),
    ]
    const download = async (key: string, target: string, attempt = 1): Promise<boolean> => {
      try {
        const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

        if (Body === undefined) {
          throw new Error(`${key} has no body.`)
        }

        await mkdir(dirname(target), { recursive: true })
        await writeFile(`${target}.part`, await Body.transformToByteArray())
        await rename(`${target}.part`, target)

        return true
      } catch (error) {
        if (error instanceof Error && error.name === "NoSuchKey") {
          return false
        }

        if (attempt === DOWNLOAD_ATTEMPTS) {
          throw error
        }

        await new Promise((resolveDelay) => {
          setTimeout(resolveDelay, 2 ** attempt * 500)
        })

        return download(key, target, attempt + 1)
      }
    }
    const missing: string[] = []
    let skipped = 0

    console.log(`Downloading ${keys.length} images from "${bucket}" into ${out}...`)

    await forEachConcurrently(keys, Number(args.concurrency), async (key, index) => {
      const target = join(out, key)

      if (existsSync(target)) {
        skipped++
      } else if (!(await download(key, target))) {
        missing.push(key)
      }

      if ((index + 1) % 1000 === 0) {
        console.log(`  ${index + 1} / ${keys.length}`)
      }
    })

    const missingReport = `${out}-missing.txt`

    await writeFile(
      missingReport,
      missing
        .sort()
        .map((key) => `${key}\n`)
        .join(""),
    )

    console.log(
      `Done. ${keys.length - skipped - missing.length} downloaded, ${skipped} already present, ${missing.length} missing from the bucket (listed in ${missingReport}).`,
    )
    process.exit(0)
  },
})
