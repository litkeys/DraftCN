# Tech Stack

This is the **DEFINITIVE** technology selection for the entire project. All development must use these exact versions.

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe development | Prevents runtime errors, improves IDE support, essential for complex drag-drop logic |
| Frontend Framework | Next.js | 15.0+ | React framework with App Router | Latest performance optimizations, React 19 support, excellent Vercel integration |
| UI Component Library | shadcn/ui | Latest | Accessible, customizable components | Copy-paste model allows customization, well-tested patterns, Tailwind integration |
| State Management | Zustand | 4.5+ | Client-side state management | Lightweight (8kb), simple API, perfect for drag-drop state, excellent TypeScript support |
| Backend Language | N/A | - | No backend for MVP | Client-side only per requirements |
| Backend Framework | N/A | - | No backend for MVP | Future: Next.js API routes |
| API Style | N/A | - | No API for MVP | Future: REST or tRPC |
| Database | N/A | - | No persistence for MVP | All state in memory only |
| Cache | Browser Memory | - | Runtime state caching | Zustand manages in-memory state |
| File Storage | N/A | - | No file storage needed | Blocks stored in memory only |
| Authentication | N/A | - | No auth for MVP | Public access only |
| Frontend Testing | Vitest | 1.0+ | Unit testing | Fast, Jest-compatible, works well with Vite |
| Backend Testing | N/A | - | No backend to test | Future: Vitest for API routes |
| E2E Testing | Playwright | 1.40+ | Integration testing (post-MVP) | Modern, fast, good debugging tools |
| Build Tool | Next.js Turbopack | Built-in | Development builds | Faster than Webpack, built into Next.js 15 |
| Bundler | Next.js/Webpack | Built-in | Production builds | Automatic optimization |
| IaC Tool | N/A | - | No infrastructure needed | Vercel handles everything |
| CI/CD | GitHub Actions | Latest | Automated testing/deployment | Free for public repos, Vercel integration |
| Monitoring | Vercel Analytics | Latest | Basic metrics (optional) | Built-in, zero-config |
| Logging | Console | Browser | Development debugging | No server logs needed |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first styling | Required by shadcn/ui, fast development |
| Runtime | React | 19.0+ | UI library | Latest concurrent features, improved performance |
| Package Manager | npm | 10.0+ | Dependency management | Built-in workspaces support |
| Linting | ESLint | 8.50+ | Code quality | Next.js preset included |
| Formatting | Prettier | 3.0+ | Code formatting | Consistent code style |
| Template Management | JavaScript Objects | Built-in | Template registry system | Manual registration of block templates |
| Component Runtime | React.lazy | 19.0+ | Dynamic component loading | Load block templates on demand |
| Style Management | Global CSS | - | Shared block styles | Centralized styling in globals.css |
| Asset Management | Base64/URLs | - | Template thumbnails | Simple image handling for previews |
