# Technical Assumptions

### Repository Structure: Monorepo
Single repository containing the entire Next.js application with clear separation of concerns through folder structure. This simplifies dependency management and ensures atomic commits across the entire MVP.

### Service Architecture
**Monolith** - Single Next.js application with client-side state management. All logic runs in the browser with no backend services. Uses Zustand for state management, keeping all builder logic in a centralized store. Future expansion can add API routes within the same Next.js app.

### Testing Requirements
**Unit Only** for MVP phase. Focus on testing critical functions like grid calculations, drag manager logic, and state mutations. Component testing deferred to post-MVP when UI stabilizes. No E2E tests needed since there's no backend or persistence.

### Additional Technical Assumptions and Requests
- **Framework**: Next.js 15+ with App Router for modern React Server Components support
- **React Version**: React 19 for latest performance optimizations and concurrent features
- **UI Components**: shadcn/ui for all interface elements - provides accessibility and customization
- **State Management**: Zustand for predictable, lightweight client-side state
- **Styling**: Tailwind CSS (required by shadcn/ui) with CSS-in-JS for dynamic styles
- **TypeScript**: Strict mode enabled for type safety across the application
- **Build Tool**: Next.js built-in Turbopack for fast development builds
- **Package Manager**: npm (standard for compatibility)
- **Browser Support**: Modern evergreen browsers only (Chrome, Firefox, Edge, Safari latest versions)
- **No Database**: All data exists in memory only
- **No Authentication**: Public access, no user accounts
- **No Cloud Services**: Fully client-side, can be deployed as static site
- **Code Organization**: Feature-based folder structure with separation of templates, blocks, and processing logic
- **Template System**: TypeScript AST-based processing for extracting template metadata
- **Component Runtime**: Dynamic component loading with React.lazy and props injection
- **Style Architecture**: Centralized global CSS with template-specific style references
- **Performance Target**: 60fps during drag operations through React.memo and optimized re-renders
