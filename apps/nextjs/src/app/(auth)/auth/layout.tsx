export default function Layout(props: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center sm:py-12">
      {props.children}
    </main>
  );
}
