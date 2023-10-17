import { Button } from "@nextui-org/button";
import { FlagIcon, SettingsIcon, SunMoonIcon } from "lucide-react";

import ThemeSwitch from "~/components/ui/ThemeSwitch";

export const NavbarPopoversCommonOptions = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        className="justify-normal gap-3 p-2 text-medium font-medium"
        startContent={<SettingsIcon />}
        variant="light"
        isDisabled
      >
        Parâmetros
      </Button>
      <Button
        className="disabled justify-normal gap-3 p-2 text-medium font-medium"
        startContent={<FlagIcon />}
        variant="light"
        isDisabled
      >
        Língua
      </Button>
      <div className="flex justify-between">
        <div className="flex gap-3 p-2">
          <SunMoonIcon />
          <p className="select-none text-medium font-medium">Tema</p>
        </div>
        <ThemeSwitch />
      </div>
    </div>
  );
};
