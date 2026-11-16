import { z } from "zod"
import { draftMarker, findDraftComment, github, requireEnv } from "./github.ts"

const pullNumber = Number(requireEnv("PR_NUMBER"))
const roleMention = `<@&${requireEnv("DISCORD_ROLE_ID")}>`
const styleExample = `# ☀️ O Taiyō 2.0 chegou!

Reconstruímos o Taiyō do zero. Todas as páginas são novas, da página inicial ao leitor, e quase tudo por trás delas também. Olha o que mudou:

📖 **Um leitor feito pra você**
Página única, página dupla ou rolagem contínua (manhwas e manhuas já abrem em rolagem). Zoom, brilho, contraste, marcadores, download pra ler offline e o próximo capítulo emendado sem sair da página.

🔔 **Nunca mais perca um capítulo**
Capítulos novos da sua biblioteca e dos grupos que você segue chegam na hora, com notificações push no celular e no PC.

👉 https://taiyo.moe

Achou um bug ou tem uma ideia? Manda aqui no Discord! 💛`
const instructions = `You write the release announcements that Taiyō, a manga, manhwa and manhua reading site, posts in its Discord server. Write in Brazilian Portuguese, in a warm, casual tone for readers, not developers.

Rules:
- Only mention changes a reader or a scan group would notice. Skip refactors, tests, dependencies, tooling and internal fixes. Group related changes and describe what the person can now do, never how it was built.
- A work is always "obra" (never "título" or "mídia"). A chapter is "capítulo", a scan group is "grupo".
- Start with a "# " heading that names the version. A release with only fixes gets a short message: a heading, one or two sentences and a short list at most.
- Use Discord markdown: "# " for the heading, **bold** section titles introduced by one emoji, short paragraphs or "- " lists. No tables, no code blocks.
- End with "👉 https://taiyo.moe" and an invitation to report bugs in the Discord.
- Never mention a role, @everyone or @here, and never invent a feature that is not in the notes.
- Stay under 1700 characters.
- Reply with the message only.

Here is a past announcement, to match its tone and format:

${styleExample}`
const pullSchema = z.object({ title: z.string(), body: z.string().nullable() })
const responseSchema = z.object({
  output: z.array(
    z.object({
      type: z.string(),
      content: z.array(z.object({ type: z.string(), text: z.string().optional() })).optional(),
    }),
  ),
})
const releasePull = await github(`/pulls/${pullNumber}`, pullSchema)
const releaseNotes = releasePull.body ?? ""
const includedNumbers = [
  ...new Set(
    Array.from(releaseNotes.matchAll(/\/(?:issues|pull)\/(\d+)\)/g), (match) => Number(match[1])),
  ),
]
const includedPulls = await Promise.all(
  includedNumbers.slice(0, 40).map(async (number) => {
    const pull = await github(`/pulls/${number}`, pullSchema)
    const description = (pull.body ?? "")
      .replaceAll(/<!--[\s\S]*?-->/g, "")
      .trim()
      .slice(0, 1500)

    return `### #${number}: ${pull.title}\n\n${description}`
  }),
)
const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    authorization: `Bearer ${requireEnv("OPENAI_API_KEY")}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: requireEnv("OPENAI_MODEL"),
    instructions,
    input: `Release: ${releasePull.title}\n\n## Release notes\n\n${releaseNotes}\n\n## Pull requests in this release\n\n${includedPulls.join("\n\n")}`,
  }),
})

if (!response.ok) {
  throw new Error(`OpenAI request failed: ${response.status} ${await response.text()}`)
}

const { output } = responseSchema.parse(await response.json())
const message = output
  .flatMap((item) => (item.type === "message" ? (item.content ?? []) : []))
  .filter((part) => part.type === "output_text")
  .map((part) => part.text ?? "")
  .join("")
  .trim()

if (message === "") {
  throw new Error("OpenAI returned an empty message")
}

const body = `${draftMarker}
### Discord announcement

When this PR is merged, the message inside the block below is posted to Discord exactly as written. Edit this comment to change it, delete the comment to post nothing, or add the \`discord-draft\` label again for a new draft.

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
