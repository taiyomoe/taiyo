#!/usr/bin/env node

import { Command } from "commander"
import { migrateCommand } from "./commands/migrate"
import { seedCommand } from "./commands/seed"

const program = new Command("@taiyomoe/scripts")
  .addCommand(migrateCommand)
  .addCommand(seedCommand)

program.parseAsync()
