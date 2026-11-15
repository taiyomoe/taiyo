export const AUDIT_LOG_HISTOGRAM_INTERVALS = [
  "1m",
  "5m",
  "10m",
  "30m",
  "1h",
  "3h",
  "12h",
  "1d",
  "1w",
  "1M",
  "1y",
] as const

export type AuditLogHistogramInterval = (typeof AUDIT_LOG_HISTOGRAM_INTERVALS)[number]

export const AUDIT_LOG_HISTOGRAM_INTERVAL_MS: Record<AuditLogHistogramInterval, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "10m": 600_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "3h": 10_800_000,
  "12h": 43_200_000,
  "1d": 86_400_000,
  "1w": 604_800_000,
  "1M": 2_592_000_000,
  "1y": 31_536_000_000,
}

export const AUDIT_LOG_MAX_HISTOGRAM_BUCKETS = 500
