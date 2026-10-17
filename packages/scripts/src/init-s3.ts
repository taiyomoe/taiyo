import { CreateBucketCommand, getS3Bucket, getS3Client, PutBucketPolicyCommand } from "@taiyomoe/s3"
import { defineCommand } from "citty"

export default defineCommand({
  meta: {
    name: "init-s3",
    description:
      "Create the configured S3 bucket if it does not exist, and let anonymous clients read its objects.",
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
        console.log("Already exists.")
      } else {
        throw error
      }
    }

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
    console.log("Objects are publicly readable.")

    process.exit(0)
  },
})
