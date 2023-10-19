"use client";

import { Button } from "@nextui-org/button";
import { signIn } from "next-auth/react";

import { CompanyLogo } from "~/components/ui/CompanyLogo";

export const GoogleButton = () => {
  return (
    <Button
      className="hover:bg-google/80 w-full bg-google text-medium font-medium text-google-foreground"
      startContent={<CompanyLogo company="google" height={28} />}
      onClick={() => signIn("google")}
      radius="full"
      isDisabled
    >
      <p className="w-full">Google</p>
    </Button>
  );
};
