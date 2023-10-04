import { Button } from "@nextui-org/button";
import { FlagIcon, SettingsIcon, SunMoonIcon } from "lucide-react";

import ThemeSwitch from "~/components/ui/ThemeSwitch";

export const NavbarPopoversCommonOptions = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        className="text-medium justify-normal gap-3 p-2 font-medium"
        startContent={<SettingsIcon />}
        variant="light"
        isDisabled
      >
        Parâmetros
      </Button>
      <Button
        className="text-medium disabled justify-normal gap-3 p-2 font-medium"
        startContent={<FlagIcon />}
        variant="light"
        isDisabled
      >
        Língua
      </Button>
      <div className="flex justify-between">
        <div className="flex gap-3 p-2">
          <SunMoonIcon />
          <p className="text-medium select-none font-medium">Tema</p>
        </div>
        <ThemeSwitch />
      </div>
    </div>
  );
};
