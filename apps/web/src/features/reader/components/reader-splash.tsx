import * as stylex from "@stylexjs/stylex"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  splash: {
    inset: 0,
    alignItems: "center",
    backgroundColor: "#000",
    color: "rgb(255 255 255 / 64%)",
    display: "flex",
    justifyContent: "center",
    position: "fixed",
  },
})

export function ReaderSplash() {
  return (
    <div aria-busy="true" aria-label={m.reader_loading()} role="status" sx={styles.splash}>
      <Spinner size={28} />
    </div>
  )
}
