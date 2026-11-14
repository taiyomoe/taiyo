import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"
import { CountdownTile } from "@/features/maintenance/components/countdown-tile"
import { useCountdown } from "@/features/maintenance/hooks/use-countdown"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "1.25rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    marginTop: "1rem",
  },
  tiles: {
    gap: "0.75rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  done: {
    margin: 0,
    color: scene.goldPale,
    fontSize: "0.875rem",
  },
})

export const Countdown = ({ endsAt }: { endsAt: number }) => {
  const remaining = Math.ceil(useCountdown(endsAt) / 1000)

  return (
    <div sx={styles.root}>
      <div role="timer" aria-label={m.maintenance_countdown_label()} sx={styles.tiles}>
        <CountdownTile value={Math.floor(remaining / 3600)} label={m.maintenance_hours()} />
        <CountdownTile
          value={Math.floor((remaining % 3600) / 60)}
          label={m.maintenance_minutes()}
        />
        <CountdownTile value={remaining % 60} label={m.maintenance_seconds()} />
      </div>
      {remaining === 0 ? <p sx={styles.done}>{m.maintenance_almost_back()}</p> : null}
    </div>
  )
}
