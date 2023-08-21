import type { ComponentProps } from "react";

import { CSRF_experimental } from "@taiyo/auth";

type Props = ComponentProps<"button">;

export const SignOut = (props: Props) => {
  return (
    <form action={`/api/auth/signout`} method="post">
      <button {...props} />
      <CSRF_experimental />
    </form>
  );
};
