"use client" // Error boundaries must be Client Components

import { Button } from "@heroui/react"
import { HomeIcon, RotateCwIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: Props) {
  const handlePress = () => {
    reset()
  }

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8 p-bodyPadding lg:gap-12">
        <Image
          src={"/illustrations/bug_fixing.svg"}
          className="hidden lg:block"
          width={500}
          height={500}
          alt="ege"
        />
        <p className="text-center font-bold text-2xl tracking-tight lg:text-5xl">
          Uh-oh, ocorreu um erro inesperado!
        </p>
        <div className="space-y-2 text-center">
          <p className="lg:text-lg">
            Desculpe, mas não conseguimos carregar a página que você está
            procurando.
          </p>
          <p className="lg:text-lg">
            Já fomos notificados e vamos tentar corrigir o problema. Entretanto,
            tente novamente ou volte à página inicial.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <Button
            as={Link}
            href="/"
            startContent={<HomeIcon />}
            color="primary"
            variant="flat"
          >
            Voltar à página inicial
          </Button>
          <Button
            onPress={handlePress}
            color="primary"
            startContent={<RotateCwIcon />}
          >
            Tentar de novo
          </Button>
        </div>
      </div>
    </div>
  )
}
