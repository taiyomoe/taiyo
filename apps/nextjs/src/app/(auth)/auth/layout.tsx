export default function Layout(props: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen flex-col items-center justify-center sm:py-12">
      {props.children}
    </main>
  );
}
