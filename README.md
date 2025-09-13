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
│   ├── web/               # Next.js web application
│   ├── io-worker/         # Background job processor
│   └── storybook/         # Component documentation
├── packages/            # Shared packages
│   ├── auth/              # Authentication utilities
│   ├── cache/             # Caching layer
│   ├── config/            # Shared configuration
│   ├── db/                # Database layer
│   ├── email/             # Email templates and utilities
│   ├── global-types/      # Global TypeScript types
│   ├── logs/              # Logging layer
│   ├── meilisearch/       # Search engine integration
│   ├── messages/          # Internationalization message files
│   ├── messaging/         # Message queue utilities
│   ├── s3/                # File storage utilities
│   ├── schemas/           # Zod validation schemas
│   ├── trpc/              # tRPC API layer
│   ├── types/             # TypeScript types
│   └── utils/             # Shared utilities
└── tooling/             # Development tools
    ├── github/            # GitHub Actions
    ├── tailwind/          # Tailwind CSS configuration
    └── typescript/        # TypeScript configuration
```

### 🛠️ Tech Stack

**Frontend:**

- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Base UI](https://www.baseui.com/) for accessible components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Next Intl](https://next-intl-docs.vercel.app/) for internationalization
- [PostHog](https://posthog.com/) for analytics

**Backend:**

- [tRPC](https://trpc.io/) for type-safe APIs
- [Prisma](https://www.prisma.io/) as ORM
- [Better Auth](https://www.better-auth.com/) for authentication
- [BullMQ](https://bullmq.io/) for job queues
- [Zod](https://zod.dev/) for schema validation
- [ClickHouse](https://clickhouse.com/) for logging

**Infrastructure:**

- [PostgreSQL](https://www.postgresql.org/) - Primary database
- [Meilisearch](https://www.meilisearch.com/) - Search engine
- [Dragonfly](https://www.dragonflydb.io/) - Redis-compatible cache
- [ClickHouse](https://clickhouse.com/) - Analytics database
- [S3-compatible storage](https://aws.amazon.com/s3/) - File storage

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 22.x.x (specified in `.nvmrc`)
- **pnpm**: 10.x.x (specified in `package.json`)
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
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start infrastructure services**

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**

   ```bash
   pnpm -F @taiyomoe/db run migrate
   ```

6. **Start development servers**

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

# Code Quality
pnpm check:ws           # Run Biome linting and formatting
pnpm lint:ws            # Run Sherif for dependency validation
pnpm knip               # Check for unused dependencies
```

### Package-Specific Commands

```bash
# Database
pnpm -F @taiyomoe/db run db migrate    # Run database migrations
pnpm -F @taiyomoe/db run seed          # Seed database with sample data

# Web Application
pnpm -F @taiyomoe/web run dev          # Start web app in dev mode
pnpm -F @taiyomoe/web run build        # Build web app for production
pnpm -F @taiyomoe/web run start        # Start production web app

# Storybook
pnpm -F @taiyomoe/storybook run dev    # Start Storybook dev server
pnpm -F @taiyomoe/storybook run build-storybook  # Build static Storybook

# IO Worker
pnpm -F @taiyomoe/io-worker run start  # Start background job processor
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

The are 30+ environment variables that are used in the project. You can find them in the `.env.example` file.

## 📦 Package Overview

### Core Packages

- **`@taiyomoe/db`**: Database layer with Prisma ORM, migrations, and data models
- **`@taiyomoe/auth`**: Authentication system with Better Auth integration
- **`@taiyomoe/trpc`**: Type-safe API layer with tRPC
- **`@taiyomoe/schemas`**: Zod validation schemas for data validation
- **`@taiyomoe/utils`**: Shared utility functions and helpers

### Service Packages

- **`@taiyomoe/cache`**: Caching layer with Dragonfly integration
- **`@taiyomoe/meilisearch`**: Search engine integration
- **`@taiyomoe/s3`**: File storage utilities
- **`@taiyomoe/email`**: Email templates and sending utilities
- **`@taiyomoe/messaging`**: Message queue utilities

### Configuration Packages

- **`@taiyomoe/config`**: Shared configuration and constants
- **`@taiyomoe/types`**: Global TypeScript type definitions
- **`@taiyomoe/messages`**: Internationalization message files

## 🚀 Deployment

### Production Build

```bash
# Build all packages and applications
pnpm build

# Start production servers
pnpm -F @taiyomoe/web run start
pnpm -F @taiyomoe/io-worker run start
```

### Docker Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm check:ws`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
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
