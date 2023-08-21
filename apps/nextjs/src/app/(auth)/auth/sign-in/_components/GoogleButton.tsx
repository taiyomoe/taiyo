import type { ComponentProps } from "react";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { SignIn } from "./SignIn";

type Props = Omit<ComponentProps<typeof SignIn>, "provider">;

export const GoogleButton = (props: Props) => {
  return (
    <SignIn
      provider="discord"
      className="flex w-full items-center gap-3 rounded-full bg-white px-6 py-2 font-semibold text-black no-underline hover:bg-white/80 disabled:cursor-not-allowed disabled:bg-white disabled:opacity-60 disabled:hover:bg-white disabled:hover:opacity-60"
      {...props}
    >
      <CompanyLogo company="google" width={40} height={40} />
      <p className="w-full">Google</p>
    </SignIn>
  );
};
