import type { ComponentProps } from "react";

import type { OAuthProviders } from "@taiyo/auth";
import { CSRF_experimental } from "@taiyo/auth";

export const SignIn = ({
  provider,
  ...props
}: { provider: OAuthProviders } & ComponentProps<"button">) => {
  return (
    <form action={`/api/auth/signin/${provider}`} method="post">
      <button {...props} />
      <CSRF_experimental />
    </form>
  );
};
