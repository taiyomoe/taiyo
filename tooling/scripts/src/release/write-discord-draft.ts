import { z } from "zod"
import { writeAnnouncement } from "./announcement.ts"
import { draftMarker, findDraftComment, github, requireEnv } from "./github.ts"

const pullNumber = Number(requireEnv("PR_NUMBER"))
const roleMention = `<@&${requireEnv("DISCORD_ROLE_ID")}>`
const releasePull = await github(
  `/pulls/${pullNumber}`,
  z.object({ title: z.string(), body: z.string().nullable() }),
)
const message = await writeAnnouncement(releasePull.title, releasePull.body ?? "")
const body = `${draftMarker}
### Discord announcement

When this PR is merged, the message inside the block below is posted to Discord exactly as written. Edit this comment to change it, drop images below the block to post them with it, delete the comment to post nothing, or add the \`discord-draft\` label again for a new draft.

~~~~markdown
${roleMention}
${message}
~~~~

<sub>${message.length + roleMention.length + 1} / 2000 characters. A longer message is split into several posts.</sub>`
const existing = await findDraftComment(pullNumber)

await (existing === undefined
  ? github(`/issues/${pullNumber}/comments`, z.unknown(), {
      method: "POST",
      body: JSON.stringify({ body }),
    })
  : github(`/issues/comments/${existing.id}`, z.unknown(), {
      method: "PATCH",
      body: JSON.stringify({ body }),
    }))
await github(`/issues/${pullNumber}/labels/discord-draft`, z.unknown(), { method: "DELETE" }).catch(
  () => undefined,
)

console.log(message)
