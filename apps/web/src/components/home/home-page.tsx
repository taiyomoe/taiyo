import * as stylex from "@stylexjs/stylex"
import { authClient } from "@taiyomoe/auth/client"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { type Session, sessionQueryOptions } from "@/lib/queries/session"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  page: {
    padding: "2rem",
    gap: "1.5rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "100dvh",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: text.xl,
    fontWeight: font.weightBold,
  },
})

export function HomePage({ user }: { user: Session["user"] }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const signOut = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, null)
      await router.invalidate()
    },
  })

  return (
    <main sx={styles.page}>
      <h1 sx={styles.heading}>{m.home_greeting({ name: user.name })}</h1>
      <Button variant="outline" loading={signOut.isPending} onClick={() => signOut.mutate()}>
        {m.home_sign_out()}
      </Button>
    </main>
  )
}
