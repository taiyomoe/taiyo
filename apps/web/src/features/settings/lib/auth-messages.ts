import { m } from "@/paraglide/messages"

export const AUTH_SETTINGS_MESSAGES: Record<string, () => string> = {
  INVALID_PASSWORD: m.user_settings_password_wrong,
  INVALID_CODE: m.user_settings_2fa_invalid_code,
  INVALID_BACKUP_CODE: m.user_settings_2fa_invalid_backup_code,
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: m.user_settings_2fa_too_many_attempts,
  ACCOUNT_TEMPORARILY_LOCKED: m.user_settings_2fa_locked,
  INVALID_TWO_FACTOR_COOKIE: m.user_settings_2fa_expired,
  SESSION_EXPIRED: m.user_settings_session_expired,
  SOCIAL_ACCOUNT_ALREADY_LINKED: m.user_settings_already_linked,
  FAILED_TO_UNLINK_LAST_ACCOUNT: m.user_settings_disconnect_last,
  PASSWORD_ALREADY_SET: m.user_settings_password_already_set,
  PASSWORD_TOO_SHORT: m.user_settings_password_short,
  PASSWORD_TOO_LONG: m.user_settings_password_long,
}
