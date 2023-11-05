import type { LayoutProps } from "~/lib/types";

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="flex h-screen flex-col items-center justify-center sm:py-12">
      {children}
    </main>
  );
}
