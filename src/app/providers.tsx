"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "~/lib/trpc/Provider";

type ProviderProps = {
  children: React.ReactNode;
  headers: Headers;
};

export const Providers = (props: ProviderProps) => {
  return (
    <TRPCReactProvider headers={props.headers}>
      <NextUIProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Toaster richColors />
          {props.children}
        </ThemeProvider>
      </NextUIProvider>
    </TRPCReactProvider>
  );
};
