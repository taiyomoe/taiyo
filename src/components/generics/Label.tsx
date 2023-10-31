import type { InputProps } from "@nextui-org/react";
import { tv } from "tailwind-variants";

import { cn } from "~/utils/cn";

type Props = {
  label: string;
  labelPlacement?: InputProps["labelPlacement"];
  className?: string;
  id?: string;
  children: React.ReactNode;
};

export type LabelProps = Omit<Props, "children">;

const labelVariants = tv({
  slots: {
    container: "flex min-w-fit",
    base: "block text-small font-medium text-foreground pb-1.5 will-change-auto origin-top-left transition-all !duration-200 !ease-out motion-reduce:transition-none",
  },
  variants: {
    labelPlacement: {
      inside: {},
      outside: {
        container: "flex-col",
      },
      "outside-left": {
        container: "items-center",
        base: "min-w-[100px] mr-6",
      },
    },
  },
});

export const Label = ({
  label,
  labelPlacement = "outside",
  className,
  id,
  children,
}: Props) => {
  const { container, base } = labelVariants();

  return (
    <div className={cn(container({ labelPlacement }), className)}>
      <label className={base({ labelPlacement })} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
};
