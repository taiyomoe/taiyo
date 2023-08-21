export default function Layout(props: { children: React.ReactNode }) {
  return <main className="flex h-screen flex-col">{props.children}</main>;
}
