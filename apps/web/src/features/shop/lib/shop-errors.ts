import { m } from "@/paraglide/messages"

export const SHOP_ERROR_MESSAGES: Record<string, () => string> = {
  INSUFFICIENT_POINTS: m.shop_error_not_enough,
  ALREADY_OWNED: m.shop_error_owned,
  LOOT_BOX_EXHAUSTED: m.shop_error_exhausted,
  SHOP_IMPERSONATION: m.shop_error_impersonating,
  RATE_LIMITED: m.error_generic,
}
