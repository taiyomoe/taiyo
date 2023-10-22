import type { LayoutProps } from "~/types";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-4xl font-semibold">Upar capítulo</p>
      {children}
    </div>
  );
}
