import { DiscordLogo } from "~/components/logos/DiscordLogo";
import { SignIn } from "./SignIn";

export const DiscordLogin = () => {
  return (
    <div>
      <SignIn
        provider="discord"
        className="flex items-center gap-3 rounded-full bg-[#5865F2] px-8 py-3 font-semibold no-underline hover:bg-[#5865F2]/80"
      >
        <DiscordLogo width={30} height={30} />
        <p>Sign in with Discord</p>
      </SignIn>
    </div>
  );
};
