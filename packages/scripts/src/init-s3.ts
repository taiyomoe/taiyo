import { CreateBucketCommand, getS3Bucket, getS3Client } from "@taiyomoe/s3"
import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "init-s3",
    description: "Create the configured S3 bucket if it does not exist.",
  },
  run: async () => {
    const s3 = getS3Client()
    const bucket = getS3Bucket()

    console.log(`Creating bucket "${bucket}"...`)

    try {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }))
      console.log("Done.")
    } catch (error) {
      const name = error instanceof Error ? error.name : ""

      if (name === "BucketAlreadyOwnedByYou" || name === "BucketAlreadyExists") {
        console.log("Already exists, nothing to do.")
      } else {
        throw error
      }
    }

    process.exit(0)
  },
})
