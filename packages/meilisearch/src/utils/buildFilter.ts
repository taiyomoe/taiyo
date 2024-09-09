import { DateTime } from "luxon"

export const buildFilter = (input: string) =>
  input
    // deletedAt = 1725228000
    .replace(
      /(\w+At) = (\d+)/g,
      (_, field, v) =>
        `${field} >= ${v} AND ${field} <= ${DateTime.fromSeconds(Number(v)).plus({ days: 1 }).toSeconds()}`,
    )

    // deletedAt != 1725228000
    .replace(
      /(\w+At) != (\d+)/g,
      (_, field, v) =>
        `${field} < ${v} OR ${field} >= ${DateTime.fromSeconds(Number(v)).plus({ days: 1 }).toSeconds()}`,
    )

    // deletedAt > 1725228000
    .replace(
      /At > (\d+)/g,
      (_, v) =>
        `At > ${DateTime.fromSeconds(Number(v)).plus({ days: 1 }).toSeconds()}`,
    )

    // deletedAt <= 1725228000
    .replace(
      /At <= (\d+)/g,
      (_, v) =>
        `At <= ${DateTime.fromSeconds(Number(v)).plus({ days: 1 }).toSeconds()}`,
    )

    // not userId in [UUID, UUID]
    .replace(/\$not\((\w*) in (.*)\)/g, (_, field, v) => `${field} NOT IN ${v}`)

    // volume = null, volume != null
    .replace(/(=|!=) null/g, (_, op) =>
      op === "=" ? "IS NULL" : "IS NOT NULL",
    )

    // (volume = 1 and number = 3) or userId = UUID
    .replace(/\b(?:and|or|not|in|is|null)\b/g, (token) => token.toUpperCase())
