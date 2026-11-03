import type { PaletteCommand } from "@/features/command-palette/lib/palette-command"

const toWords = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
const LABEL_EXACT = 4
const LABEL_PREFIX = 3
const KEYWORD_PREFIX = 2
const WEAK = 1
const tokenScore = (
  token: string,
  label: string[],
  keywords: string[],
  hint: string[],
  labelText: string,
) => {
  if (label.includes(token)) {
    return LABEL_EXACT
  }

  if (label.some((word) => word.startsWith(token))) {
    return LABEL_PREFIX
  }

  if (keywords.some((word) => word.startsWith(token))) {
    return KEYWORD_PREFIX
  }

  if (labelText.includes(token) || hint.some((word) => word.startsWith(token))) {
    return WEAK
  }

  return 0
}

export type CommandMatch = { score: number; strong: boolean; weak: boolean }

export const matchCommand = (query: string, command: PaletteCommand): CommandMatch | null => {
  const tokens = toWords(query)

  if (tokens.length === 0) {
    return { score: 0, strong: false, weak: true }
  }

  const subject = command.subject ?? ""
  const label = toWords(subject === "" ? command.label : command.label.replace(subject, " "))
  const keywords = (command.keywords ?? []).flatMap(toWords)
  const hint = [...toWords(command.hint ?? ""), ...toWords(subject)]
  const labelText = label.join(" ")
  let score = 0
  let strong = true
  let weak = true

  for (const token of tokens) {
    const value = tokenScore(token, label, keywords, hint, labelText)

    if (value === 0) {
      return null
    }

    score += value
    strong &&= value >= KEYWORD_PREFIX
    weak &&= value === WEAK
  }

  const phrase = tokens.join(" ")

  if (labelText.startsWith(phrase)) {
    score += 3
  } else if (labelText.includes(phrase)) {
    score += 1
  }

  return { score, strong, weak }
}

export const rankCommands = (query: string, commands: readonly PaletteCommand[]) =>
  commands
    .flatMap((command, index) => {
      const match = matchCommand(query, command)

      return match === null ? [] : [{ command, index, ...match }]
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
