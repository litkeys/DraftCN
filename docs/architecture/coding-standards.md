# Coding Standards

### Critical Fullstack Rules

- **Type Safety:** All code must be TypeScript with strict mode enabled
- **Component Patterns:** Use functional components with hooks, no class components
- **State Updates:** Never mutate state directly - use Zustand actions only
- **Block Templates:** Must be manually registered with complete metadata and component reference
- **Grid Positioning:** All positions in pixels, grid snapping at 60px intervals
- **Error Handling:** All user actions must have error boundaries
- **Performance:** Components handling drag must use React.memo
- **Accessibility:** All interactive elements must have keyboard support

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `BlockInstance.tsx` |
| Hooks | camelCase with 'use' | - | `useDrag.ts` |
| Functions | camelCase | - | `snapToGrid()` |
| Types/Interfaces | PascalCase | - | `BlockTemplate` |
| Files | kebab-case or PascalCase | - | `block-renderer.tsx` |
| CSS Classes | kebab-case | - | `canvas-grid` |
| Store Actions | camelCase | - | `addBlock()` |
| Constants | UPPER_SNAKE_CASE | - | `GRID_SIZE` |
