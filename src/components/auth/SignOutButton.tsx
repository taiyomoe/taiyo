"use client";

import { Button } from "@nextui-org/button";
import { signOut } from "next-auth/react";

export const SignOutButton = () => {
  return (
    <Button
      className="min-w-[220px] text-medium font-medium"
      variant="flat"
      color="danger"
      onClick={() => signOut()}
    >
      <p>Sair</p>
    </Button>
  );
};
