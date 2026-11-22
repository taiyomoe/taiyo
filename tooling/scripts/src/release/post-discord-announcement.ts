import { z } from "zod"
import { findDraftComment, github, requireEnv } from "./github.ts"

const tag = requireEnv("RELEASE_TAG")
const roleId = requireEnv("DISCORD_ROLE_ID")
const webhookUrl = process.env.DISCORD_WEBHOOK_URL ?? ""
const discordLimit = 2000

if (webhookUrl === "") {
  console.log("DISCORD_WEBHOOK_URL is not set, nothing to post.")
  process.exit(0)
}

const { sha } = await github(`/commits/${tag}`, z.object({ sha: z.string() }))
const pulls = await github(
  `/commits/${sha}/pulls`,
  z.array(z.object({ number: z.number(), merged_at: z.string().nullable() })),
)
const releasePull = pulls.find((pull) => pull.merged_at !== null)

if (releasePull === undefined) {
  console.log(`No merged pull request points at ${tag}, nothing to post.`)
  process.exit(0)
}

const draft = await findDraftComment(releasePull.number)

if (draft === undefined) {
  console.log(`#${releasePull.number} has no Discord draft, nothing to post.`)
  process.exit(0)
}

const block = /~~~~markdown\r?\n([\s\S]*?)\r?\n~~~~/.exec(draft.body)
const message = block?.[1]?.trim()

if (block === null || message === undefined || message === "") {
  throw new Error(`The Discord draft on #${releasePull.number} has no ~~~~markdown block`)
}

const outsideBlock = draft.body.replace(block[0], "")
const imageUrls = [
  ...outsideBlock.matchAll(
    /!\[[^\]]*\]\((https:\/\/[^)\s]+)\)|<img[^>]*\ssrc="(https:\/\/[^"]+)"/g,
  ),
]
  .map((match) => match[1] ?? match[2] ?? "")
  .slice(0, 10)
const images = await Promise.all(
  imageUrls.map(async (url, index) => {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Could not download ${url}: ${response.status}`)
    }

    const type = response.headers.get("content-type") ?? "image/png"

    return {
      blob: new Blob([await response.arrayBuffer()], { type }),
      filename: `image-${index + 1}.${type.split("/")[1]?.split(/[;+]/)[0] ?? "png"}`,
    }
  }),
)
const chunks = message.split(/\n{2,}/).reduce<string[]>((acc, paragraph) => {
  const last = acc.at(-1)

  if (last !== undefined && last.length + paragraph.length + 2 <= discordLimit) {
    acc[acc.length - 1] = `${last}\n\n${paragraph}`
  } else {
    acc.push(...(paragraph.match(new RegExp(`[\\s\\S]{1,${discordLimit}}`, "g")) ?? []))
  }

  return acc
}, [])

for (const [index, content] of chunks.entries()) {
  const attached = index === chunks.length - 1 ? images : []
  const form = new FormData()

  form.append(
    "payload_json",
    JSON.stringify({
      content,
      allowed_mentions: { parse: [], roles: [roleId] },
      attachments: attached.map((image, id) => ({ id, filename: image.filename })),
    }),
  )

  for (const [id, image] of attached.entries()) {
    form.append(`files[${id}]`, image.blob, image.filename)
  }

  const response = await fetch(`${webhookUrl}?wait=true`, { method: "POST", body: form })

  if (!response.ok) {
    throw new Error(
      `Discord rejected the announcement: ${response.status} ${await response.text()}`,
    )
  }
}

console.log(
  `Posted the ${tag} announcement from #${releasePull.number} in ${chunks.length} message(s) with ${images.length} image(s).`,
)
