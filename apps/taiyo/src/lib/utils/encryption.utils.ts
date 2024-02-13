import crypto from "crypto"

import { env } from "~/lib/env.mjs"

const algorithm = "aes-256-cbc" //Using AES encryption

const encrypt = (input: string) => {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(env.ENCRYPTION_KEY, "hex"),
    Buffer.from(env.ENCRYPTION_IV, "hex"),
  )
  let encrypted = cipher.update(input, "utf8", "hex")

  encrypted += cipher.final("hex")

  return encrypted
}

export const EncryptionUtils = {
  encrypt,
}
