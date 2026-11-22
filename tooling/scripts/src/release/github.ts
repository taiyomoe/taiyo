import { z } from "zod"

export const draftMarker = "<!-- taiyo:discord-draft -->"

const draftAuthor = "github-actions[bot]"

export const requireEnv = (name: string) => {
  const value = process.env[name]

  if (value === undefined || value === "") {
    throw new Error(`${name} is not set`)
  }

  return value
}

export const github = async <T extends z.ZodType>(
  path: string,
  schema: T,
  init: RequestInit = {},
) => {
  const response = await fetch(
    `https://api.github.com/repos/${requireEnv("GITHUB_REPOSITORY")}${path}`,
    {
      ...init,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${requireEnv("GITHUB_TOKEN")}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `GitHub ${init.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`,
    )
  }

  return schema.parse(response.status === 204 ? undefined : await response.json())
}

const commentsSchema = z.array(
  z.object({ id: z.number(), body: z.string(), user: z.object({ login: z.string() }) }),
)

export const findDraftComment = async (pullNumber: number) => {
  const comments: z.infer<typeof commentsSchema> = []

  for (let page = 1; ; page++) {
    const batch = await github(
      `/issues/${pullNumber}/comments?per_page=100&page=${page}`,
      commentsSchema,
    )

    comments.push(...batch)

    if (batch.length < 100) {
      break
    }
  }

  return comments
    .filter((comment) => comment.user.login === draftAuthor && comment.body.startsWith(draftMarker))
    .at(-1)
}
