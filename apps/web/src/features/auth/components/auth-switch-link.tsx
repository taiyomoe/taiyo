import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"

export const AuthSwitchLink = ({
  prompt,
  label,
  to,
}: {
  prompt: string
  label: string
  to: "/auth/sign-in" | "/auth/sign-up" | "/auth/forgot-password"
}) => (
  <p sx={sx.footer}>
    {prompt}{" "}
    <Link from="/auth" search={({ redirect }) => ({ redirect })} to={to} {...stylex.props(sx.link)}>
      {label}
    </Link>
  </p>
)
