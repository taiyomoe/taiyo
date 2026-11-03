import { createElement } from "react"
import { describe, expect, it } from "vitest"
import type { PaletteCommand } from "../palette-command"
import { matchCommand, rankCommands } from "../match-command"

const command = (
  id: string,
  label: string,
  extra: Partial<Pick<PaletteCommand, "keywords" | "hint">> = {},
): PaletteCommand => ({
  id,
  label,
  section: "navigate",
  icon: () => createElement("svg"),
  run: { type: "perform", perform: () => {} },
  ...extra,
})

describe("matchCommand", () => {
  it("matches every query word against label word prefixes", () => {
    expect(matchCommand("upl chap", command("upload", "Upload chapter"))).toMatchObject({
      strong: true,
    })
  })

  it("matches keywords as strongly as labels, but scores them lower", () => {
    const viaKeyword = matchCommand(
      "upload chapter",
      command("a", "Upload", { keywords: ["chapter"] }),
    )
    const viaLabel = matchCommand("upload chapter", command("b", "Upload chapter"))

    expect(viaKeyword?.strong).toBe(true)
    expect(viaLabel?.score).toBeGreaterThan(viaKeyword?.score ?? 0)
  })

  it("rejects a command when one word matches nothing", () => {
    expect(matchCommand("upload banner", command("upload", "Upload chapter"))).toBeNull()
  })

  it("ignores case and diacritics", () => {
    expect(matchCommand("TAIYO", command("home", "Taiyō home"))).not.toBeNull()
  })

  it("treats hint and mid-word matches as weak", () => {
    expect(
      matchCommand("solo", command("edit", "Suggest an edit", { hint: "Solo Leveling" })),
    ).toMatchObject({ strong: false })
    expect(matchCommand("load", command("upload", "Upload chapter"))).toMatchObject({
      strong: false,
    })
  })
})

describe("subjects", () => {
  it("only matches the subject weakly", () => {
    const upload = command("upload", "Upload chapter for Solo Leveling", {})

    expect(matchCommand("solo", { ...upload, subject: "Solo Leveling" })).toMatchObject({
      strong: false,
      weak: true,
    })
    expect(matchCommand("upload solo", { ...upload, subject: "Solo Leveling" })).toMatchObject({
      weak: false,
    })
  })
})

describe("rankCommands", () => {
  it("puts the closest label first and keeps the given order on ties", () => {
    const ranked = rankCommands("upload chapter", [
      command("global", "Upload", { keywords: ["chapter"] }),
      command("context", "Upload chapter for Solo Leveling"),
      command("other", "Upload chapter as Scans"),
    ])

    expect(ranked.map((entry) => entry.command.id)).toEqual(["context", "other", "global"])
  })
})
