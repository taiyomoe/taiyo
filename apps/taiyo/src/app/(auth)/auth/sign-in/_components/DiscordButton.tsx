import { Button } from "@nextui-org/button"
import { signIn } from "@taiyomoe/auth"
import { CompanyLogo } from "~/components/ui/CompanyLogo"

export const DiscordButton = () => {
  return (
    <form>
      <Button
        className="w-full bg-discord font-medium text-discord-foreground text-medium hover:bg-discord/80"
        startContent={<CompanyLogo company="discord" height={28} />}
        formAction={async () => {
          "use server"
          await signIn("discord")
        }}
        radius="full"
        type="submit"
      >
        <p className="w-full">Discord</p>
      </Button>
    </form>
  )
}
