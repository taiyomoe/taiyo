if (!process.env.CI) {
  process.loadEnvFile()
}

process.env.TEST = "1"
