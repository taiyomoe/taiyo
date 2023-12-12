import type { LayoutProps } from "~/lib/types";

export const Stepper = ({ children }: LayoutProps) => (
  <div className="flex flex-col gap-12">{children}</div>
);
