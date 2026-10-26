import * as stylex from "@stylexjs/stylex"
import { font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { scene } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const TABS = [
  { type: "sign-up", label: m.auth_sign_up, to: "/auth/sign-up" },
  { type: "sign-in", label: m.auth_sign_in, to: "/auth/sign-in" },
] as const
const styles = stylex.create({
  tabs: {
    padding: "0.25rem",
    borderColor: `color-mix(in srgb, ${scene.paper} 8%, transparent)`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.25rem",
    backgroundColor: `color-mix(in srgb, ${scene.paper} 6%, transparent)`,
    display: "inline-flex",
  },
  tab: {
    borderRadius: radius.full,
    borderStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: "1.25rem",
    backgroundColor: "transparent",
    color: {
      default: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
      ":hover": scene.paper,
    },
    cursor: "pointer",
    fontFamily: font.sans,
    fontSize: "0.875rem",
    fontWeight: 700,
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
  },
  // Applied after `tab` rather than through a `[data-active]` condition:
  // a later argument to stylex.props() always wins, whereas an attribute
  // condition and the `:hover` above could resolve either way.
  tabActive: {
    backgroundColor: scene.paper,
    color: "#1b0f0a",
  },
})

type AuthTabsProps = {
  type: "sign-in" | "sign-up"
}

export const AuthTabs = ({ type }: AuthTabsProps) => (
  <div sx={styles.tabs}>
    {TABS.map((tab) => (
      <Link
        key={tab.type}
        to={tab.to}
        data-active={tab.type === type}
        {...stylex.props(styles.tab, tab.type === type && styles.tabActive)}
      >
        {tab.label()}
      </Link>
    ))}
  </div>
)
