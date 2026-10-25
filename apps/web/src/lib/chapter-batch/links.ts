import { config } from "@taiyomoe/config"

export const NUMBER_TOKEN = "{number}"

export const isWebUrl = (value: string) => {
  if (value.length > config.input.maxUrlLength) {
    return false
  }

  try {
    const url = new URL(value)

    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const resolveLink = (own: string, template: string, number: string) => {
  if (own.trim() !== "") {
    return own.trim()
  }

  return template.trim() === "" ? null : template.trim().split(NUMBER_TOKEN).join(number.trim())
}

export const hostOf = (value: string) => {
  try {
    return new URL(value).host
  } catch {
    return value
  }
}
