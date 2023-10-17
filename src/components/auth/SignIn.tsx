import type { ButtonProps } from "@nextui-org/button";
import { Button } from "@nextui-org/button";

type Props = {
  provider: "discord" | "google";
  classNames?: { button?: string; form?: string };
} & Omit<ButtonProps, "className">;

export const SignIn = ({ provider, classNames, ...props }: Props) => {
  return (
    <form
      className={classNames?.form}
      action={`/api/auth/signin/${provider}`}
      method="post"
    >
      <Button className={classNames?.button} {...props} type="submit" />
    </form>
  );
};
