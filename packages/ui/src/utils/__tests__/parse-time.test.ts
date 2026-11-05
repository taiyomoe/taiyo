import { describe, expect, it } from "vitest"
import { parseTime } from "../parse-time"

describe("parseTime", () => {
  it.each([
    ["9", "09:00"],
    ["930", "09:30"],
    ["0930", "09:30"],
    ["1430", "14:30"],
    ["9:30", "09:30"],
    ["14.30", "14:30"],
    ["14h30", "14:30"],
    ["2:30 pm", "14:30"],
    ["2p", "14:00"],
    ["12am", "00:00"],
    ["12 PM", "12:00"],
    [" 23:59 ", "23:59"],
  ])("reads %s as %s", (text, expected) => {
    expect(parseTime(text)).toBe(expected)
  })

  it.each(["", "abc", "24:00", "12:60", "13pm", "0am", "12345", "9:3"])("rejects %j", (text) => {
    expect(parseTime(text)).toBeNull()
  })
})
