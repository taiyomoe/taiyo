import { Navbar } from "./_components/Navbar";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <Navbar />
      {props.children}
    </div>
  );
}
