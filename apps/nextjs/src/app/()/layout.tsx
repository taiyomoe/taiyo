import { Navbar } from "./_components/Navbar";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="flex h-[2000px] flex-col px-6 pt-6">
        {props.children}
      </main>
      <div className="flex w-full items-center justify-center">
        preto vai pra cima
      </div>
    </div>
  );
}
