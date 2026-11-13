import * as stylex from "@stylexjs/stylex"
import { Edit } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Link } from "@tanstack/react-router"
import type { UserProfile } from "@/features/users/api/profile"
import { RichText } from "@/components/rich-text/rich-text"
import { parseRichText } from "@/components/rich-text/rich-text-document"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { pickLocalized } from "@/lib/locale"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  empty: {
    gap: "0.875rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
})

export function AboutCard({ profile, isOwner }: { profile: UserProfile; isOwner: boolean }) {
  const about = pickLocalized(profile.about)

  return (
    <section sx={[profileStyles.card, styles.section]}>
      <h2 sx={profileStyles.sectionTitle}>{m.profile_about()}</h2>
      {about === undefined || about === "" ? (
        <div sx={styles.empty}>
          <p sx={profileStyles.empty}>
            {isOwner
              ? m.profile_about_empty_self()
              : m.profile_about_empty({ name: profile.displayUsername })}
          </p>
          {isOwner ? (
            <Button render={<Link to="/settings" />} size="sm" variant="outline">
              <Edit />
              {m.profile_about_add()}
            </Button>
          ) : null}
        </div>
      ) : (
        <RichText collapsible document={parseRichText(about)} />
      )}
    </section>
  )
}
