import {
  CreateBucketCommand,
  getS3Bucket,
  getS3Client,
  getS3PrivateBucket,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
} from "@taiyomoe/s3"
import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "init-s3",
    description:
      "Create the configured S3 buckets if they do not exist, let anonymous clients read the public one's objects, and let the web app upload chapter pages to it.",
  },
  run: async () => {
    const s3 = getS3Client()
    const bucket = getS3Bucket()
    const createBucket = async (name: string) => {
      console.log(`Creating bucket "${name}"...`)

      try {
        await s3.send(new CreateBucketCommand({ Bucket: name }))
        console.log("Done.")
      } catch (error) {
        const code = error instanceof Error ? error.name : ""

        if (code === "BucketAlreadyOwnedByYou" || code === "BucketAlreadyExists") {
          console.log("Already exists.")
        } else {
          throw error
        }
      }
    }

    await createBucket(bucket)
    await createBucket(getS3PrivateBucket())

    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: bucket,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        }),
      }),
    )
    console.log(`Objects in "${bucket}" are publicly readable.`)

    const origins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)

    if (origins.length > 0) {
      await s3.send(
        new PutBucketCorsCommand({
          Bucket: bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: origins,
                AllowedMethods: ["PUT"],
                AllowedHeaders: ["content-type"],
                MaxAgeSeconds: 3600,
              },
            ],
          },
        }),
      )
      console.log(`Browser uploads allowed from ${origins.join(", ")}.`)
    }

    process.exit(0)
  },
})
