import { Button } from "@nextui-org/button"
import { signIn } from "@taiyomoe/auth/server"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export const DiscordAuthButton = () => (
  <form>
    <Button
      className="w-full bg-discord font-medium text-discord-foreground hover:bg-discord/80"
      startContent={<CompanyLogo company="discord" height={28} />}
      formAction={async () => {
        "use server"
        await signIn("discord")
      }}
      radius="full"
      size="lg"
      type="submit"
    >
      Discord
    </Button>
  </form>
)
