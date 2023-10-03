import type { ComponentProps } from "react";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { SignIn } from "../../../../../components/auth/SignIn";

type Props = Omit<ComponentProps<typeof SignIn>, "provider">;

export const GoogleButton = (props: Props) => {
  return (
    <SignIn
      provider="discord"
      classNames={{
        form: "col-span-2 sm:col-span-1",
        button:
          "hover:bg-google/80 text-medium w-full bg-google font-medium text-google-foreground",
      }}
      startContent={<CompanyLogo company="google" height={28} />}
      radius="full"
      isDisabled
      {...props}
    >
      <p className="w-full">Google</p>
    </SignIn>
  );
};
