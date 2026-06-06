import { indexInitializers } from "@taiyomoe/search"

const main = async () => {
  for (const { name, init } of indexInitializers) {
    console.log(`Initializing ${name} index...`)
    await init()
  }

  console.log("Done.")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
