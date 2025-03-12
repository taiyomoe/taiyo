import { z } from "zod"
import { zodMessages } from "~/utils/zod-messages"

export const emailSchema = z
  .string()
  .nonempty(zodMessages.email.required)
  .email(zodMessages.email.invalid)
  .max(100, zodMessages.email.max100Characters)
