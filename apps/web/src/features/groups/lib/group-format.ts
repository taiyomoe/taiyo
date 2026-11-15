import { getLocale } from "@/paraglide/runtime"

export const formatMonthYear = (iso: string) =>
  new Intl.DateTimeFormat(getLocale(), { month: "short", year: "numeric" }).format(new Date(iso))
