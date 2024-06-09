import Image from "next/image"
import { Navbar } from "~/components/navbar/navbar"

export default function NotFound() {
  return (
    <div className="flex h-dvh select-none flex-col">
      <Navbar />
      <div className="mx-bodyPadding flex grow flex-col items-center justify-center gap-16">
        <Image
          src="/illustrations/not_found.svg"
          width={0}
          height={0}
          sizes="1"
          className="h-[45vh] w-auto"
          alt="no data illustration"
        />
        <p className="text-center font-medium text-2xl">
          Página não encontrada
        </p>
      </div>
    </div>
  )
}
