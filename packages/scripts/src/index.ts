#!/usr/bin/env node

import { Command } from "commander"
import { createMigrationCommand } from "./commands/create-migration"
import { createSeedCommand } from "./commands/create-seed"
import { migrateCommand } from "./commands/migrate"
import { seedCommand } from "./commands/seed"

const program = new Command("@taiyomoe/scripts")
  .addCommand(createMigrationCommand)
  .addCommand(migrateCommand)
  .addCommand(seedCommand)
  .addCommand(createSeedCommand)

program.parseAsync()
