import { readFile, readdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { z } from "zod"

// Where @taiyomoe/emails writes the emails it would send, when SES is not configured.
const OUTBOX_DIR = join(tmpdir(), "taiyo-emails")
const emailSchema = z.object({ to: z.string(), subject: z.string(), text: z.string() })

/** The newest email sent to the address whose text matches, waiting for it to arrive. */
export const findEmail = async (to: string, pattern: RegExp, timeoutMs = 15_000) => {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const files = await readdir(OUTBOX_DIR).catch(() => [])
    const newestFirst = [...files].sort((a, b) => b.localeCompare(a))

    for (const file of newestFirst) {
      const email = emailSchema.parse(JSON.parse(await readFile(join(OUTBOX_DIR, file), "utf8")))
      const match = pattern.exec(email.text)

      if (email.to === to && match !== null) {
        return { ...email, match }
      }
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 250)
    })
  }

  throw new Error(`No email to ${to} matching ${pattern.source}`)
}
