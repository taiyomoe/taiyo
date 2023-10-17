import { Button } from "@nextui-org/button";
import type { ButtonProps } from "@nextui-org/button";

type Props = { classNames?: { button?: string; form?: string } } & Omit<
  ButtonProps,
  "className"
>;

export const SignOut = ({ classNames, ...props }: Props) => {
  return (
    <form
      className={classNames?.form}
      action={`/api/auth/signout`}
      method="post"
    >
      <Button className={classNames?.button} {...props} type="submit" />
    </form>
  );
};
