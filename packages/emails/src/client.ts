import type { ReactElement } from "react"
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2"
import { render, toPlainText } from "@react-email/render"
import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { env } from "./env"

const ses =
  env.SES_ACCESS_KEY_ID === undefined || env.SES_SECRET_ACCESS_KEY === undefined
    ? null
    : new SESv2Client({
        region: env.SES_REGION,
        credentials: {
          accessKeyId: env.SES_ACCESS_KEY_ID,
          secretAccessKey: env.SES_SECRET_ACCESS_KEY,
        },
      })
// SES only accepts a non-ASCII display name as an RFC 2047 encoded word.
const from = `=?UTF-8?B?${Buffer.from("Taiyō").toString("base64")}?= <no-reply@taiyo.moe>`
/**
 * Where emails go when no SES credentials are set outside production: one JSON file each, so a
 * developer or an end-to-end test can follow the links they hold.
 */
const DEV_OUTBOX_DIR = join(tmpdir(), "taiyo-emails")
const writeToOutbox = async (email: { to: string; subject: string; text: string }) => {
  await mkdir(DEV_OUTBOX_DIR, { recursive: true })
  await writeFile(
    join(DEV_OUTBOX_DIR, `${Date.now()}-${randomUUID()}.json`),
    JSON.stringify({ ...email, sentAt: new Date().toISOString() }),
  )
}

export const sendEmail = async ({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}) => {
  if (ses === null) {
    if (process.env.NODE_ENV !== "production") {
      await writeToOutbox({ to, subject, text: toPlainText(await render(react)) })
    }

    return
  }

  const html = await render(react)

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: html, Charset: "UTF-8" },
            Text: { Data: toPlainText(html), Charset: "UTF-8" },
          },
        },
      },
    }),
  )
}
