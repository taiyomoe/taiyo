import type { ComponentProps } from "react";

import { SignIn } from "~/components/auth/SignIn";
import { CompanyLogo } from "~/components/ui/CompanyLogo";

type Props = Omit<ComponentProps<typeof SignIn>, "provider">;

export const DiscordButton = (props: Props) => {
  return (
    <SignIn
      provider="discord"
      classNames={{
        form: "col-span-2 sm:col-span-1",
        button:
          "hover:bg-discord/80 text-medium w-full bg-discord font-medium text-discord-foreground",
      }}
      startContent={<CompanyLogo company="discord" height={28} />}
      radius="full"
      {...props}
    >
      <p className="w-full">Discord</p>
    </SignIn>
  );
};
