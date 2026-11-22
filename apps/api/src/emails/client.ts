import type { ReactElement } from "react"
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2"
import { render, toPlainText } from "@react-email/render"
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
