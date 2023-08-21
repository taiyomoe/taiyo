export default function Layout(props: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      {props.children}
    </main>
  );
}
