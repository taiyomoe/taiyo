import type { KqlToken } from "@taiyomoe/audit/query"

export type KqlRole =
  | "field"
  | "operator"
  | "value"
  | "string"
  | "keyword"
  | "paren"
  | "wildcard"
  | "text"
  | "space"

export const getKqlRoles = (tokens: readonly KqlToken[]) => {
  const significant = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.type !== "whitespace")
  const roles: KqlRole[] = tokens.map(() => "space")
  let listDepth = 0
  const listStarts: number[] = []

  for (const [position, { token, index }] of significant.entries()) {
    const previous = significant[position - 1]?.token
    const next = significant[position + 1]?.token

    switch (token.type) {
      case "keyword": {
        roles[index] = "keyword"

        break
      }

      case "lparen": {
        const isList = previous?.type === "colon"

        if (isList) {
          listDepth += 1
          listStarts.push(position)
        }

        roles[index] = "paren"

        break
      }

      case "rparen": {
        if (listStarts.length > 0) {
          listStarts.pop()
          listDepth -= 1
        }

        roles[index] = "paren"

        break
      }

      case "colon":

      case "range": {
        roles[index] = "operator"

        break
      }

      case "string": {
        roles[index] = "string"

        break
      }

      case "word": {
        if (next?.type === "colon" || next?.type === "range") {
          roles[index] = "field"
        } else if (token.value === "*") {
          roles[index] = "wildcard"
        } else if (previous?.type === "colon" || previous?.type === "range" || listDepth > 0) {
          roles[index] = "value"
        } else {
          roles[index] = "text"
        }

        break
      }

      case "whitespace": {
        break
      }
    }
  }

  return roles
}
