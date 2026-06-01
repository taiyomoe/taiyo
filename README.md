# Taiyō

![Taiyō's banner](https://cdn.taiyo.moe/assets/banner-red.png)

A modern, full-stack manga reading platform built with Next.js, TypeScript, and a comprehensive monorepo architecture. Taiyō provides a seamless experience for discovering, reading, and managing manga, manhwa, manhua, and light novels.

## 🌟 Features

- **Multi-format Support**: Manga, Manhwa, Manhua, and Light Novels
- **Multi-language Support**: Official support for Portuguese and French, with technical capability for 100+ languages
- **Advanced Search**: Powered by Meilisearch for fast, relevant results
- **User Management**: Complete authentication system with Better Auth
- **Content Rating System**: Flexible content filtering (Normal, Suggestive, NSFW, NSFL)
- **Real-time Updates**: Latest releases and trending content
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: User preference-based theming
- **Advanced customizations**: Page-by-page, brightness, horizontal/vertical, and more
- **Chapter Management**: Upload, organize, and read chapters with page-by-page navigation
- **Group Management**: Scanlation group support with role-based permissions
- **Logs**: Comprehensive logging system with ClickHouse
- **Monitoring**: Real-time monitoring with Grafana
- **Analytics**: Comprehensive analytics and performance monitoring with PostHog

## 🏗️ Architecture

This project uses a **monorepo architecture** powered by [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces).

### 📁 Project Structure

```no-highlight
taiyo/
├── apps/                # Applications
│   └── storybook/         # Component documentation
├── packages/            # Shared packages
│   ├── auth/              # Authentication utilities
│   ├── cache/             # Caching layer
│   ├── config/            # Shared configuration
│   ├── db/                # Database layer
│   ├── email/             # Email templates and utilities
│   ├── ui/                # Shared UI components
│   └── utils/             # Shared utilities
└── tooling/             # Development tools
    ├── github/            # GitHub Actions
    └── typescript/        # TypeScript configuration
```

### 🛠️ Tech Stack

**Frontend:**

- [Next.js 16](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Base UI](https://www.baseui.com/) for accessible components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Next Intl](https://next-intl-docs.vercel.app/) for internationalization
- [PostHog](https://posthog.com/) for analytics

**Backend:**

- [Hono](https://hono.dev/) for type-safe APIs
- [Kysely](https://kysely.dev/) as the typed SQL query builder
- [Better Auth](https://www.better-auth.com/) for authentication
- [BullMQ](https://bullmq.io/) for job queues
- [Zod](https://zod.dev/) for schema validation
- [ClickHouse](https://clickhouse.com/) for logging

**Infrastructure:**

- [PostgreSQL](https://www.postgresql.org/) - Primary database
- [Meilisearch](https://www.meilisearch.com/) - Search engine
- [Dragonfly](https://www.dragonflydb.io/) - Redis-compatible cache
- [HyperDX](https://www.hyperdx.io/) - Observability and monitoring
- [ClickHouse](https://clickhouse.com/) - Analytics database
- [S3-compatible storage](https://aws.amazon.com/s3/) - File storage

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 24.11.1 (specified in `.nvmrc`)
- **pnpm**: 10.23.0 (specified in `package.json`)
- **Docker & Docker Compose**: For local infrastructure

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/taiyomoe/taiyo.git
   cd taiyo
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start infrastructure services**

   ```bash
   docker-compose up -d
   ```

5. **Configure the S3 client**

Please refer to the [@taiyomoe/s3](./packages/s3/README.md) package documentation for more details.

6. **Run database migrations**

   ```bash
   pnpm -F db kysely migrate latest
   ```

7. **Seed the database with sample data**

   ```bash
   pnpm -F db kysely seed run
   ```

8. **Start development servers**

   ```bash
   pnpm dev
   ```

The application will be available at:

- **Web App**: <http://localhost:3000>
- **Storybook**: <http://localhost:6006>

## 📝 Available Scripts

### Root Level Commands

```bash
# Development
pnpm dev                 # Start all apps in development mode
pnpm build              # Build all packages and apps
pnpm typecheck          # Run TypeScript type checking
pnpm clean              # Clean all node_modules
pnpm clean:ws           # Clean workspace build artifacts

# Testing
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode

# Code Quality
pnpm check:ws           # Run Biome linting and formatting
pnpm lint:ws            # Run Sherif for dependency validation
pnpm knip               # Check for unused dependencies and dead code
```

### Package-Specific Commands

```bash
# Database
pnpm -F db kysely migrate latest   # Run database migrations
pnpm -F db kysely seed run         # Seed database with sample data

# Storybook
pnpm -F storybook run dev          # Start Storybook dev server
pnpm -F storybook run build        # Build static Storybook
```

## 🔧 Development

### Git Flow

This project uses [git-flow](https://git-flow.readthedocs.io/en/latest/presentation.html) for branch management:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation branches

### Code Quality

- **Linting**: [Biome](https://biomejs.dev/) for fast linting and formatting
- **Type Checking**: TypeScript with strict configuration
- **Dependency Validation**: [Sherif](https://github.com/QuiiBz/sherif) for workspace consistency
- **Unused Code Detection**: [Knip](https://knip.dev/) for finding unused dependencies

### Package Management

- **Workspace Dependencies**: Use `workspace:^` for internal packages
- **Version Management**: All packages use semantic versioning
- **Dependency Installation**: Always use `pnpm` (not npm or yarn)

## 🌐 Environment Variables

There are 30+ environment variables that are used in the project. You can find them in the `.env.example` file.

## 📦 Package Overview

### Core Packages

- **`@taiyomoe/db`**: Database layer with Kysely (typed SQL query builder), migrations, seeds, and per-table model types
- **`@taiyomoe/auth`**: Authentication system with Better Auth integration
- **`@taiyomoe/utils`**: Shared utility functions and helpers
- **`@taiyomoe/ui`**: Shared UI components built with React and Tailwind CSS

### Service Packages

- **`@taiyomoe/cache`**: Caching layer with Dragonfly integration
- **`@taiyomoe/email`**: Email templates and sending utilities

### Configuration Packages

- **`@taiyomoe/config`**: Shared configuration and constants

## 🚀 Deployment

### Production Build

```bash
# Build all packages and applications
pnpm build
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm check:ws`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feat/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MangaDex](https://mangadex.org/) for UI inspiration and manga data

---

**Taiyō** - Bringing manga to life with modern technology 🌅
