import { describe, expect, it, vi } from "vitest"
import { normalizeUsername } from "../normalize-username"

// Mock faker to return a predictable value
vi.mock("@faker-js/faker", () => ({
  faker: {
    internet: {
      username: vi.fn<() => string>(() => "generated_username"),
    },
  },
}))

describe("normalizeUsername", () => {
  it("should convert spaces to underscores", () => {
    expect(normalizeUsername("john doe")).toBe("john_doe")
    expect(normalizeUsername("test user name")).toBe("test_user_name")
  })

  it("should convert to lowercase", () => {
    expect(normalizeUsername("JohnDoe")).toBe("johndoe")
    expect(normalizeUsername("TEST_USER")).toBe("test_user")
  })

  it("should remove invalid characters", () => {
    expect(normalizeUsername("john@doe")).toBe("johndoe")
    expect(normalizeUsername("test-user!")).toBe("testuser")
    expect(normalizeUsername("user#123")).toBe("user123")
  })

  it("should preserve valid characters", () => {
    expect(normalizeUsername("john_doe")).toBe("john_doe")
    expect(normalizeUsername("user.name")).toBe("user.name")
    expect(normalizeUsername("test123")).toBe("test123")
  })

  it("should truncate to maxLength (30)", () => {
    const longInput = "a".repeat(50)
    const result = normalizeUsername(longInput)

    expect(result.length).toBe(30)
    expect(result).toBe("a".repeat(30))
  })

  it("should return faker username if normalized length is less than minLength (3)", () => {
    expect(normalizeUsername("ab")).toBe("generated_username")
    expect(normalizeUsername("a")).toBe("generated_username")
    expect(normalizeUsername("")).toBe("generated_username")
  })

  it("should return normalized value if length is at least minLength (3)", () => {
    expect(normalizeUsername("abc")).toBe("abc")
    expect(normalizeUsername("test")).toBe("test")
  })

  it("should handle mixed case and special characters", () => {
    expect(normalizeUsername("John Doe!")).toBe("john_doe")
    expect(normalizeUsername("Test-User@123")).toBe("testuser123")
  })

  it("should handle edge cases", () => {
    expect(normalizeUsername("   ")).toBe("___")
    expect(normalizeUsername("!!!")).toBe("generated_username")
    expect(normalizeUsername("a_b")).toBe("a_b")
  })
})
