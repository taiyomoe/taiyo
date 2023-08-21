import type { ComponentProps } from "react";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { SignIn } from "../../../../../components/auth/SignIn";

type Props = Omit<ComponentProps<typeof SignIn>, "provider">;

export const DiscordButton = (props: Props) => {
  return (
    <SignIn
      provider="discord"
      className="flex w-full items-center gap-3 rounded-full bg-[#5865F2] px-6 py-2 font-semibold no-underline hover:bg-[#5865F2]/80"
      {...props}
    >
      <CompanyLogo company="discord" width={40} height={40} />
      <p className="w-full">Discord</p>
    </SignIn>
  );
};
