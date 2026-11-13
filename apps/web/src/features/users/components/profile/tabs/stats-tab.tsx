import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { Cover } from "@/features/media/components/cover"
import {
  LIBRARY_STATUS_LABELS,
  LIBRARY_STATUSES,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"
import {
  type UserProfile,
  type UserStats,
  userStatsQueryOptions,
} from "@/features/users/api/profile"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { BarList } from "@/features/users/components/profile/tabs/bar-list"
import { GenreDonut } from "@/features/users/components/profile/tabs/genre-donut"
import { useHoverTip } from "@/features/users/components/profile/tabs/hover-tip"
import { statsStyles } from "@/features/users/components/profile/tabs/stats-styles"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  top: {
    gap: "1.25rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "minmax(0, 2fr) minmax(0, 1fr)",
    },
  },
  totals: {
    margin: 0,
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  total: {
    gap: "0.75rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  totalValue: {
    margin: 0,
    fontFamily: font.mono,
    fontSize: "1.375rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  },
  totalUnit: {
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: "0.8125rem",
    fontWeight: 500,
    marginInlineStart: "0.3125rem",
  },
  covers: {
    margin: 0,
    padding: 0,
    gap: "0.875rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [breakpoints.md]: "repeat(6, minmax(0, 1fr))",
    },
  },
  coverItem: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  coverLink: {
    borderRadius: radius.lg,
    gap: "0.375rem",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  cover: {
    borderRadius: radius.lg,
    width: "100%",
  },
  coverTitle: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "0.8125rem",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  coverMeta: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  columns: {
    gap: "4px",
    alignItems: "end",
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    height: "7rem",
  },
  column: {
    gap: "0.375rem",
    alignItems: "stretch",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    height: "100%",
    minWidth: 0,
  },
  bar: {
    backgroundColor: {
      default: colors.primary,
      ":hover": `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
    },
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: "2px",
  },
  barEmpty: {
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
  },
  monthLabel: {
    color: colors.mutedForeground,
    fontSize: "0.625rem",
    textAlign: "center",
    textTransform: "uppercase",
  },
  baseline: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  uploadTiles: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  smallValue: {
    fontFamily: font.mono,
    fontSize: "1.25rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
  },
  uploadsLayout: {
    gap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.lg]: "minmax(0, 18rem) minmax(0, 1fr)",
    },
  },
})

function Card({
  title,
  note,
  flush = false,
  children,
}: {
  title: string
  note?: string
  flush?: boolean
  children: React.ReactNode
}) {
  return (
    <section sx={[profileStyles.card, flush && profileStyles.flush, statsStyles.cardBody]}>
      <div sx={statsStyles.cardHead}>
        <h3 sx={profileStyles.sectionTitle}>{title}</h3>
        {note === undefined ? null : <span sx={statsStyles.cardNote}>{note}</span>}
      </div>
      {children}
    </section>
  )
}

const days = (count: number) =>
  count === 1 ? m.profile_stats_day() : m.profile_stats_days({ count })

function Reading({
  reading,
  library,
}: {
  reading: NonNullable<UserStats["reading"]>
  library: UserStats["library"]
}) {
  const format = (value: number) => value.toLocaleString(getLocale())

  return (
    <>
      <div sx={styles.top}>
        <Card
          flush
          note={m.profile_stats_genres_note({ count: format(reading.mediasRead) })}
          title={m.profile_stats_genres()}
        >
          {reading.genres.length === 0 ? (
            <p sx={profileStyles.empty}>{m.profile_stats_no_reading()}</p>
          ) : (
            <GenreDonut genres={reading.genres} />
          )}
        </Card>
        <Card
          flush
          note={m.profile_stats_streak_note({ days: days(reading.longestStreak) })}
          title={m.profile_stats_totals()}
        >
          <dl sx={styles.totals}>
            <div sx={styles.total}>
              <dt sx={statsStyles.tileLabel}>{m.profile_stats_chapters_read()}</dt>
              <dd sx={styles.totalValue}>{format(reading.chaptersRead)}</dd>
            </div>
            <div sx={styles.total}>
              <dt sx={statsStyles.tileLabel}>{m.profile_stats_titles_read()}</dt>
              <dd sx={styles.totalValue}>{format(reading.mediasRead)}</dd>
            </div>
            <div sx={styles.total}>
              <dt sx={statsStyles.tileLabel}>{m.profile_stats_current_streak()}</dt>
              <dd sx={styles.totalValue}>
                {format(reading.currentStreak)}
                <span sx={styles.totalUnit}>
                  {reading.currentStreak === 1
                    ? m.profile_highlight_day()
                    : m.profile_highlight_days()}
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
      <div sx={statsStyles.grid}>
        {library === null ? null : (
          <Card
            note={
              library.total === 1
                ? m.profile_stats_library_total_one()
                : m.profile_stats_library_total({ count: format(library.total) })
            }
            title={m.profile_stats_library()}
          >
            <BarList
              items={LIBRARY_STATUSES.map((status) => ({
                key: status,
                label: LIBRARY_STATUS_LABELS[status](),
                value: library.byStatus[status],
                title: `${LIBRARY_STATUS_LABELS[status]()}: ${format(library.byStatus[status])}`,
              }))}
            />
          </Card>
        )}
        <Card title={m.profile_stats_by_type()}>
          {reading.byType.length === 0 ? (
            <p sx={profileStyles.empty}>{m.profile_stats_no_reading()}</p>
          ) : (
            <BarList
              items={reading.byType.map((row) => ({
                key: row.type,
                label: MEDIA_TYPE_LABELS[row.type](),
                value: row.count,
                title: `${MEDIA_TYPE_LABELS[row.type]()}: ${format(row.count)}`,
              }))}
            />
          )}
        </Card>
        <Card title={m.profile_stats_by_language()}>
          {reading.byLanguage.length === 0 ? (
            <p sx={profileStyles.empty}>{m.profile_stats_no_reading()}</p>
          ) : (
            <BarList
              items={reading.byLanguage.map((row) => ({
                key: row.language,
                label: (
                  <>
                    <LanguageFlag language={row.language} />
                    {getLanguageName(row.language)}
                  </>
                ),
                value: row.count,
                title: `${getLanguageName(row.language)}: ${format(row.count)}`,
              }))}
            />
          )}
        </Card>
      </div>
      {reading.topMedias.length === 0 ? null : (
        <Card title={m.profile_stats_top_titles()}>
          <ol sx={styles.covers}>
            {reading.topMedias.map((media) => (
              <li key={media.id} sx={styles.coverItem}>
                <Link
                  params={{ mediaId: media.id }}
                  to="/media/$mediaId"
                  {...stylex.props(styles.coverLink)}
                >
                  <Cover alt={media.title ?? ""} src={media.coverUrl} sx={styles.cover} />
                  <span sx={styles.coverTitle}>{media.title ?? m.media_untitled()}</span>
                  <span sx={styles.coverMeta}>
                    {media.chapters === 1
                      ? m.profile_stats_top_chapters_one()
                      : m.profile_stats_top_chapters({ count: format(media.chapters) })}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </>
  )
}

function Uploads({ uploads }: { uploads: UserStats["uploads"] }) {
  const tip = useHoverTip()
  const locale = getLocale()
  const max = Math.max(1, ...uploads.monthly.map((month) => month.count))
  const monthShort = new Intl.DateTimeFormat(locale, { month: "narrow", timeZone: "UTC" })
  const monthLong = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })

  return (
    <Card title={m.profile_stats_uploads()}>
      <div sx={styles.uploadsLayout}>
        <div sx={styles.uploadTiles}>
          <div sx={statsStyles.tile}>
            <span sx={styles.smallValue}>{uploads.chapters.toLocaleString(locale)}</span>
            <span sx={statsStyles.tileLabel}>{m.profile_stats_uploaded_chapters()}</span>
          </div>
          <div sx={statsStyles.tile}>
            <span sx={styles.smallValue}>{uploads.medias.toLocaleString(locale)}</span>
            <span sx={statsStyles.tileLabel}>{m.profile_stats_uploaded_titles()}</span>
          </div>
          <div sx={statsStyles.tile}>
            <span sx={styles.smallValue}>{uploads.languages.toLocaleString(locale)}</span>
            <span sx={statsStyles.tileLabel}>{m.profile_stats_upload_languages()}</span>
          </div>
          {uploads.lastAt === null ? null : (
            <div sx={statsStyles.tile}>
              <span sx={styles.smallValue}>
                {new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
                  new Date(uploads.lastAt),
                )}
              </span>
              <span sx={statsStyles.tileLabel}>{m.profile_stats_last_upload()}</span>
            </div>
          )}
        </div>
        <div sx={statsStyles.cardBody}>
          <span sx={statsStyles.cardNote}>{m.profile_stats_monthly()}</span>
          <div role="list" sx={[styles.columns, styles.baseline]} {...tip.handlers}>
            {uploads.monthly.map((month) => {
              const date = new Date(`${month.month}-01T00:00:00Z`)
              const label = m.profile_stats_uploads_month({
                count: month.count.toLocaleString(locale),
                month: monthLong.format(date),
              })

              return (
                <div key={month.month} aria-label={label} role="listitem" sx={styles.column}>
                  <div
                    data-tip={label}
                    style={{ height: `${(month.count / max) * 100}%` }}
                    sx={[styles.bar, month.count === 0 && styles.barEmpty]}
                  />
                  <span aria-hidden sx={styles.monthLabel}>
                    {monthShort.format(date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {tip.element}
    </Card>
  )
}

export function StatsTab({ profile }: { profile: UserProfile }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: stats } = useSuspenseQuery(userStatsQueryOptions(profile.id, contentRatings))

  return (
    <div sx={statsStyles.root}>
      {stats.reading === null ? (
        <p sx={[profileStyles.card, profileStyles.flush, profileStyles.empty]}>
          {m.profile_stats_private({ name: profile.displayUsername })}
        </p>
      ) : (
        <Reading library={stats.library} reading={stats.reading} />
      )}
      {stats.uploads.chapters === 0 ? null : <Uploads uploads={stats.uploads} />}
    </div>
  )
}
