import { tv } from "@nextui-org/react";

type Props = {
  title: string;
  size?: "lg";
  children: React.ReactNode;
};

const category = tv({
  slots: {
    container: "flex flex-col gap-2 justify-start",
    title: "font-semibold",
  },
  variants: {
    size: {
      lg: {
        title: "text-lg",
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export const Category = ({ title, size, children }: Props) => {
  const { container, title: titleClass } = category({ size });

  return (
    <div className={container()}>
      <h3 className={titleClass()}>{title}</h3>
      {children}
    </div>
  );
};
