# Development Workflow

## Local Development Setup

### Prerequisites

```bash
# Required software
node --version  # v20.0.0 or higher
npm --version   # v10.0.0 or higher
git --version   # Any recent version
```

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/draftcn.git
cd draftcn

# Install dependencies
npm install

# Copy environment variables (though none needed for MVP)
cp .env.example .env.local

# Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button badge scroll-area
```

### Development Commands

```bash
# Start all services
npm run dev
# Runs Next.js dev server on http://localhost:3000

# Start frontend only (same as above for MVP)
npm run dev

# Start backend only (N/A for MVP)
# No backend in MVP

# Run tests
npm run test        # Run unit tests
npm run test:watch  # Watch mode
npm run test:e2e    # E2E tests (if configured)

# Linting and formatting
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix issues
npm run format      # Prettier formatting

# Type checking
npm run type-check  # TypeScript validation

# Build for production
npm run build      # Create production build
npm run start      # Run production build locally
```

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
# No environment variables required for MVP
# All configuration is hardcoded

# Future variables might include:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
# NEXT_PUBLIC_STORAGE_URL=https://storage.example.com
```
