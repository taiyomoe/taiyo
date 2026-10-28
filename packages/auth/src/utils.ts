"use server"

import { headers } from "next/headers"

export const getIp = async () => {
  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1"
  }

  const FALLBACK_IP_ADDRESS = "0.0.0.0"
  const heads = await headers()
  const forwardedFor = heads.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS
  }

  return heads.get("x-real-ip") ?? FALLBACK_IP_ADDRESS
}
