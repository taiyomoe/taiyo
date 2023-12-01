"use client";

import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();

  const renderButtonIcon = () => {
    switch (theme) {
      case "system":
        return <ComputerIcon size={16} />;
      case "dark":
        return <MoonIcon size={16} />;
      case "light":
        return <SunIcon size={16} />;
    }
  };

  const renderButtonContent = () => {
    switch (theme) {
      case "system":
        return "Sistema";
      case "dark":
        return "Escuro";
      case "light":
        return "Branco";
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className="px-3 text-small"
          variant="solid"
          startContent={renderButtonIcon()}
          isDisabled
        >
          {renderButtonContent()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu selectionMode="single" aria-label="Theme options">
        <DropdownItem value="system" onPress={() => setTheme("system")}>
          Sistema
        </DropdownItem>
        <DropdownItem value="dark" onPress={() => setTheme("dark")}>
          Escuro
        </DropdownItem>
        <DropdownItem value="light" onPress={() => setTheme("light")}>
          Branco
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ThemeSwitch;
