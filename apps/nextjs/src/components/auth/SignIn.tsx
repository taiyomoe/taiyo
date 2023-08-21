import type { ComponentProps } from "react";

import type { OAuthProviders } from "@taiyo/auth";
import { CSRF_experimental } from "@taiyo/auth";

type Props = { provider: OAuthProviders } & ComponentProps<"button">;

export const SignIn = ({ provider, ...props }: Props) => {
  return (
    <form action={`/api/auth/signin/${provider}`} method="post">
      <button {...props} />
      <CSRF_experimental />
    </form>
  );
};
