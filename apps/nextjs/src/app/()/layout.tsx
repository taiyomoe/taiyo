import { Navbar } from "./_components/Navbar";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex h-full flex-col p-6">{props.children}</main>
    </div>
  );
}
