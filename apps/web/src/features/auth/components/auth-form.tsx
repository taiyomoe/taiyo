import * as stylex from "@stylexjs/stylex"
import { scene } from "@/components/scene/scene.stylex"
import { AuthTabs } from "@/features/auth/components/auth-tabs"
import { AuthScene } from "@/features/auth/components/scene/auth-scene"
import { SignInForm } from "@/features/auth/components/sign-in-form"
import { SignUpForm } from "@/features/auth/components/sign-up-form"

const LG = "@media (width >= 64rem)"
const styles = stylex.create({
  screen: {
    overflow: "hidden",
    backgroundColor: scene.night,
    color: scene.paper,
    display: "grid",
    gridTemplateColumns: { [LG]: "1.05fr 0.95fr", default: null },
    height: "100svh",
  },
  panel: {
    paddingBlock: "2rem",
    paddingInline: "clamp(28px,5vw,76px)",
    backgroundImage: "linear-gradient(180deg, #1b0f0a, #150c08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    scrollbarWidth: "none",
    height: "100svh",
    overflowY: "auto",
  },
  column: {
    marginInline: "auto",
    maxWidth: "26.875rem",
    width: "100%",
  },
})

type AuthFormProps = {
  type: "sign-in" | "sign-up"
}

export const AuthForm = ({ type }: AuthFormProps) => (
  <div data-auth-screen sx={styles.screen}>
    <AuthScene />
    <div sx={styles.panel}>
      <div sx={styles.column}>
        <AuthTabs type={type} />
        {type === "sign-in" ? <SignInForm /> : <SignUpForm />}
      </div>
    </div>
  </div>
)
