const ZWJ = "‍"

export const getTwemojiUrl = (emoji: string) =>
  `/twemoji/${Array.from(emoji.includes(ZWJ) ? emoji : emoji.replace(/️/g, ""), (char) =>
    (char.codePointAt(0) ?? 0).toString(16),
  ).join("-")}.svg`

export const unifiedToEmoji = (unified: string) =>
  String.fromCodePoint(...unified.split("-").map((code) => Number.parseInt(code, 16)))
