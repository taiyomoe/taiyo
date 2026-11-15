import { IMAGE_MIME_TYPES } from "@taiyomoe/db"
import { getS3Bucket, getS3Client, PutObjectCommand } from "@taiyomoe/s3"
import { defineCommand } from "citty"
import { readdir, readFile } from "node:fs/promises"
import { extname, join, relative, resolve, sep } from "node:path"
import { forEachConcurrently } from "./concurrency.ts"
import { repoRoot } from "./env-file.ts"

const CONTENT_TYPES = new Map<string, string>([
  ...Object.entries(IMAGE_MIME_TYPES).map(([mime, extension]) => [`.${extension}`, mime] as const),
  [".jpg", "image/jpeg"],
])

export default defineCommand({
  meta: {
    name: "upload-sample-images",
    description: "Upload a folder from download-sample-images into the local S3 bucket.",
  },
  args: {
    dir: {
      type: "string",
      description: "Folder to upload, relative to the repository root.",
      default: "output/sample-images",
    },
    concurrency: {
      type: "string",
      description: "Parallel uploads.",
      default: "32",
    },
  },
  run: async ({ args }) => {
    const s3 = getS3Client()
    const bucket = getS3Bucket()
    const dir = resolve(repoRoot, args.dir)
    const files = (await readdir(dir, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile() && !entry.name.endsWith(".part"))
      .map((entry) => join(entry.parentPath, entry.name))

    console.log(`Uploading ${files.length} images from ${dir} into "${bucket}"...`)

    await forEachConcurrently(files, Number(args.concurrency), async (file, index) => {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: relative(dir, file).split(sep).join("/"),
          Body: await readFile(file),
          ContentType: CONTENT_TYPES.get(extname(file)) ?? "application/octet-stream",
        }),
      )

      if ((index + 1) % 1000 === 0) {
        console.log(`  ${index + 1} / ${files.length}`)
      }
    })

    console.log("Done.")
    process.exit(0)
  },
})
