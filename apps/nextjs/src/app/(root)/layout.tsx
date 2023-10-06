import { Navbar } from "./_components/Navbar";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      {props.children}
    </div>
  );
}
