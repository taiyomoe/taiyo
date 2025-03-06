"use client"

import { Button } from "@heroui/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown"
import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme()

  const renderButtonIcon = () => {
    switch (theme) {
      case "system":
        return <ComputerIcon size={16} />
      case "dark":
        return <MoonIcon size={16} />
      case "light":
        return <SunIcon size={16} />
    }
  }

  const renderButtonContent = () => {
    switch (theme) {
      case "system":
        return "Sistema"
      case "dark":
        return "Escuro"
      case "light":
        return "Branco"
    }
  }

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
      <DropdownMenu
        selectionMode="single"
        onAction={(key) => setTheme(String(key))}
        aria-label="Theme options"
      >
        <DropdownItem key="system">Sistema</DropdownItem>
        <DropdownItem key="dark">Escuro</DropdownItem>
        <DropdownItem key="light">Branco</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ThemeSwitch
