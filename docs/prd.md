# DraftCN Product Requirements Document (PRD)

## Goals and Background Context

### Goals

-   Enable non-technical users to visually build website layouts through intuitive drag-and-drop interactions
-   Provide immediate visual feedback with grid-based placement system for precise component positioning
-   Deliver a functional MVP that demonstrates core website builder capabilities without backend complexity
-   Create extensible foundation supporting future enhancements like persistence and code export
-   Validate technical approach using modern React patterns and shadcn/ui component system

### Background Context

DraftCN addresses the gap between design tools and production-ready web applications by providing a visual website builder that generates clean, maintainable React code. The current landscape shows designers struggling with handoff to developers, while developers spend significant time translating designs into code. This MVP focuses on the core interaction model - drag-and-drop with a 60px grid system - to validate that users can effectively compose layouts using pre-built shadcn/ui components.

The architecture employs a **template-based block system** where reusable block templates are manually registered in a central registry with their metadata, props interfaces, and component definitions. Templates are instantiated with customized props, and a global CSS file provides consistent styling across all blocks. This approach enables developer-friendly template creation, reusable block definitions, props-based customization, and a clear path to future inline editing capabilities.

By intentionally limiting scope (no persistence, no auth, no text editing), the project can quickly prove the viability of the grid-based placement system and freeform block positioning approach that will serve as the foundation for a more comprehensive website building solution.

### Change Log

| Date       | Version | Description                                       | Author    |
| ---------- | ------- | ------------------------------------------------- | --------- |
| 2025-01-06 | v1.0    | Initial PRD creation from technical specification | John (PM) |
| 2025-01-07 | v1.1    | Updated with architecture specifications          | John (PM) |

## Requirements

### Functional

-   FR1: The system shall provide a drag-and-drop interface allowing users to drag blocks from the left sidebar library onto the canvas
-   FR2: The canvas shall enforce a 60-pixel grid system for block placement with visual grid guidelines always visible
-   FR3: Blocks shall snap to grid positions on drop, with Alt key bypass for pixel-precise positioning
-   FR4: The canvas shall dynamically expand height based on content with a 20-cell (1200px) buffer below the lowest block
-   FR5: Users shall be able to select blocks by clicking, with visual highlighting indicating selection state
-   FR6: Selected blocks shall be deletable via Backspace or Delete key press
-   FR7: The system shall support freeform grid placement allowing blocks to overlap with z-index determining stacking order
-   FR8: Blocks shall be repositionable by dragging to new grid locations within canvas boundaries
-   FR9: The sidebar shall display available block templates organized by category with thumbnail previews
-   FR10: Block templates shall be loaded from a central registry containing pre-defined template definitions
-   FR11: Each block instance shall reference a template type and maintain customized props
-   FR12: Dead zones shall appear as semi-transparent red overlays outside the 20-cell canvas width to indicate non-droppable areas

### Non Functional

-   NFR1: The application shall be built using Next.js 15+ with App Router and React 19 for modern performance optimizations
-   NFR2: All UI components shall use shadcn/ui library for consistent, accessible, and customizable interface elements
-   NFR3: The system shall maintain 60fps performance during drag operations through efficient DOM updates and memoization
-   NFR4: Canvas width shall be responsive at 80% viewport width with reference to 20-cell (1200px) grid
-   NFR5: The application shall work without any backend, database, or authentication systems (client-side only)
-   NFR6: No data persistence is required - all work is lost on tab close or refresh
-   NFR7: The codebase shall follow a clear modular structure separating components, hooks, state, and block definitions
-   NFR8: Grid calculations shall use efficient algorithms to minimize performance impact during rapid mouse movements
-   NFR9: Block templates shall be dynamically loaded using React.lazy for optimal code splitting
-   NFR10: A global CSS file shall provide consistent styling across all block types
-   NFR11: Template registry shall maintain metadata, props interfaces, and component definitions for each template

## User Interface Design Goals

### Overall UX Vision
Minimalist, grid-focused visual builder that prioritizes clarity and predictability. Users see exactly where blocks will land through continuous grid guidelines and real-time highlighting. The interface stays out of the way with only essential controls - a simple logo, left sidebar for blocks, and expansive canvas for building.

### Key Interaction Paradigms
- **Direct manipulation**: Drag blocks directly from library to canvas with immediate visual feedback
- **Grid-first placement**: All positioning snaps to 60px grid by default, with Alt key for precision override
- **Single-click selection**: Click to select, keyboard to delete - no complex multi-selection in MVP
- **Visual boundaries**: Red dead zones clearly show valid drop areas, preventing user frustration

### Core Screens and Views
- **Main Builder View**: Single-screen application with left sidebar (20% width) and canvas (80% width)
- **Block Library Sidebar**: Scrollable list of categorized block templates with thumbnails
- **Canvas Workspace**: Grid-overlaid area for composing layouts with auto-expanding height
- **Dead Zone Indicators**: Semi-transparent red overlays marking non-droppable boundaries

### Accessibility: None
*(MVP focuses on core interactions; accessibility standards to be addressed in future iterations)*

### Branding
Clean, minimal aesthetic aligned with modern development tools. Simple logo in top-left corner. Neutral color palette with gray backgrounds, subtle grid lines, and blue selection highlights. No custom branding elements required for MVP.

### Target Device and Platforms: Web Responsive
Desktop-first design optimized for modern browsers. Canvas maintains 80% viewport width scaling. No mobile-specific optimizations in MVP phase.

## Technical Assumptions

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

## Epic List

**Epic 1: Core Builder with Freeform Drag & Drop** - Implement template-based block system with BlockTemplate and Block instance separation, create template registry and processor for TSX source files, enable freeform drag & drop from library panel to canvas (no grid snapping), support block selection/movement/deletion with props-based customization, auto-expand canvas height, and enforce boundaries with dead zone implementation

**Epic 2: Grid System with Smart Snapping** - Add 60px visible grid overlay to canvas with automatic snapping enabled by default, implement drop zone preview showing which cells will be occupied, enable Alt key bypass for pixel-precise positioning during drag operations, integrate grid system with template-based block instantiation

## Epic 1: Core Builder with Freeform Drag & Drop

**Goal:** Establish the foundational builder interface with a working drag-and-drop system that allows users to place, select, move, and delete blocks on a canvas without grid constraints. This epic delivers the core interaction model and proves the viability of the visual builder concept.

### Story 1.1: Project Setup and Basic Layout
As a developer,  
I want to initialize the Next.js project with proper configuration,  
so that I have a working foundation with all required dependencies.

**Acceptance Criteria:**
1. Next.js 15+ project created with App Router structure
2. TypeScript configured with strict mode enabled
3. Tailwind CSS installed and configured for styling
4. shadcn/ui initialized with base components
5. Zustand installed for state management
6. Basic layout with logo in top-left, left sidebar (20% width), and main canvas area (80% width) renders correctly
7. Project runs locally with npm run dev without errors

### Story 1.2: Block Data Model and Template System
As a developer,  
I want to implement the template-based block architecture,  
so that blocks have reusable templates with customizable instances.

**Acceptance Criteria:**
1. BlockTemplate interface includes (typeId, name, category, thumbnail, dependencies, defaultProps, component, defaultWidth/Height, minimumWidth/Height)
2. Block instance interface includes (id, typeId, props, x, y, width, height, z, selected)
3. Template registry system created to store and manage available templates
4. Manual template registration process defined with clear structure
5. At least 3 sample templates registered (Hero, Navbar, Footer) with components
6. Registry supports template registration, retrieval by typeId, and instance creation
7. All position values stored in pixels as specified

### Story 1.3: Template Registration System
As a developer,  
I want to manually register block templates in the registry,  
so that templates are available for use in the builder.

**Acceptance Criteria:**
1. Clear template registration structure defined in registry file
2. Each template entry includes all required metadata
3. Component imports properly configured
4. Props interfaces clearly defined for each template
5. Default props specified for initial rendering
6. Templates organized by category for easy management
7. Registration process documented with examples

### Story 1.4: Global CSS and Style Management
As a developer,  
I want to implement a centralized global CSS system,  
so that all blocks share consistent styling and theming.

**Acceptance Criteria:**
1. Global CSS file created with base styles for all blocks
2. Style imports properly configured in app layout
3. Template components reference global CSS classes
4. Consistent theming variables defined (colors, spacing, typography)
5. Styles properly loaded before block rendering
6. No style conflicts between different block types

### Story 1.5: Canvas Container with Auto-Expansion
As a user,  
I want a canvas that automatically expands as I add content,  
so that I always have space to work.

**Acceptance Criteria:**
1. Canvas maintains 80% viewport width
2. Canvas height dynamically calculated based on lowest block position plus 1200px buffer
3. Minimum height equals viewport height
4. Canvas centered with gray background container
5. Scrollable vertically when content exceeds viewport
6. Canvas re-calculates height when blocks are added/moved/removed

### Story 1.6: Block Library Sidebar with Template Loading
As a user,  
I want to see available blocks in a sidebar,  
so that I can choose what to add to my design.

**Acceptance Criteria:**
1. Left sidebar displays at 20% viewport width
2. Shows all templates from registry with thumbnails
3. Templates organized by category from BlockTemplate data
4. Sidebar scrollable if content exceeds viewport height
5. Each template shows name and thumbnail image
6. Visual hover state indicates templates are draggable
7. Templates loaded from registry on component mount

### Story 1.7: Freeform Drag and Drop with Template Instantiation
As a user,  
I want to drag blocks from the library to the canvas,  
so that I can build my layout visually.

**Acceptance Criteria:**
1. Templates draggable from sidebar using mouse
2. Dragged template preview follows cursor smoothly during drag
3. Template can be dropped anywhere on canvas (freeform, no grid)
4. On drop, block instance created from template with defaultProps
5. Block instance gets unique ID and references template typeId
6. New blocks get sequential z-index (1, 2, 3, etc.)
7. Drag operation can be cancelled with Escape key

### Story 1.8: Dead Zones and Boundary Enforcement
As a user,  
I want clear visual boundaries for valid drop areas,  
so that I know where blocks can be placed.

**Acceptance Criteria:**
1. Semi-transparent red overlays show dead zones outside canvas width
2. Dead zones visible on left, right, and bottom of canvas
3. Blocks cannot be dropped in dead zones
4. Blocks cannot be moved outside canvas boundaries
5. Visual feedback when dragging over invalid areas
6. Dead zones don't interfere with sidebar interaction

### Story 1.9: Block Selection and Deletion
As a user,  
I want to select and delete blocks,  
so that I can refine my design.

**Acceptance Criteria:**
1. Click on block to select it
2. Selected block shows blue border and semi-transparent overlay
3. Only one block selectable at a time
4. Click on canvas deselects current block
5. Backspace or Delete key removes selected block
6. Deleted block removed from state and canvas updates

### Story 1.10: Block Movement on Canvas
As a user,  
I want to reposition blocks after placing them,  
so that I can adjust my layout.

**Acceptance Criteria:**
1. Selected blocks can be dragged to new position
2. Block follows cursor during movement
3. Block position updates on mouse release
4. Movement constrained to canvas boundaries
5. Z-index maintained during movement
6. State updates with new position after move
7. Block maintains reference to template and props during move

## Epic 2: Grid System with Smart Snapping

**Goal:** Enhance the builder with a 60px grid system that provides visual guidance and automatic snapping for precise, professional layouts. This epic transforms the freeform builder into a production-ready tool with predictable placement and alignment.

### Story 2.1: Grid Overlay Implementation
As a user,  
I want to see a grid overlay on the canvas,  
so that I have visual guides for aligning blocks.

**Acceptance Criteria:**
1. 60px grid lines visible across entire canvas
2. Grid rendered using CSS background gradients for performance
3. Grid lines use subtle gray color (#e5e5e5 or similar)
4. Grid overlay positioned absolutely over canvas
5. Grid doesn't interfere with block interactions (pointer-events: none)
6. Grid remains visible at all times (no toggle in MVP)

### Story 2.2: Grid Snapping on Drop
As a user,  
I want blocks to snap to the grid when I drop them,  
so that my layouts are automatically aligned.

**Acceptance Criteria:**
1. On mouse release, block position snaps to nearest grid intersection
2. Snapping calculation rounds to nearest 60px increment
3. Both X and Y coordinates snap independently
4. Block dimensions remain unchanged (only position snaps)
5. Snapped position respects canvas boundaries
6. State stores snapped position in pixels

### Story 2.3: Drop Zone Preview
As a user,  
I want to see which grid cells will be occupied before dropping,  
so that I can place blocks precisely.

**Acceptance Criteria:**
1. During drag, highlight grid cells that block will occupy if dropped
2. Highlight updates in real-time as cursor moves
3. Highlight shows exact block dimensions on grid
4. Use semi-transparent blue overlay for valid placements
5. Use semi-transparent red overlay for invalid placements (outside canvas)
6. Highlight disappears when drag ends

### Story 2.4: Grid Snapping for Movement
As a user,  
I want blocks to snap to grid when repositioning them,  
so that all blocks maintain alignment.

**Acceptance Criteria:**
1. When moving existing blocks, position snaps to grid on release
2. During drag, block follows cursor freely (smooth movement)
3. Preview highlight shows where block will snap
4. Snapping respects block dimensions and canvas boundaries
5. Z-index preserved during grid-snapped movement

### Story 2.5: Alt Key Grid Bypass
As a user,  
I want to bypass grid snapping with the Alt key,  
so that I can achieve pixel-perfect positioning when needed.

**Acceptance Criteria:**
1. Holding Alt during drag disables grid snapping
2. With Alt pressed, blocks position at exact cursor coordinates
3. Drop zone preview disabled when Alt is pressed
4. Alt bypass works for both new blocks and repositioning
5. Visual indicator (cursor change or text) shows bypass mode active
6. Releasing Alt during drag re-enables snapping preview

## Checklist Results Report

### Executive Summary
- **Overall PRD Completeness:** 82%
- **MVP Scope Appropriateness:** Just Right
- **Readiness for Architecture Phase:** Ready
- **Most Critical Gaps:** Limited user research documentation, no quantifiable success metrics, security/compliance requirements not addressed for MVP

### Category Statuses

| Category | Status | Critical Issues |
|----------|--------|-----------------|
| 1. Problem Definition & Context | PARTIAL | Missing quantifiable impact metrics, no baseline measurements |
| 2. MVP Scope Definition | PASS | Clear scope with intentional limitations, well-reasoned exclusions |
| 3. User Experience Requirements | PASS | Clear flows, accessibility deferred but acknowledged |
| 4. Functional Requirements | PASS | Comprehensive FRs and NFRs with testable criteria |
| 5. Non-Functional Requirements | PARTIAL | Security, reliability sections minimal for MVP |
| 6. Epic & Story Structure | PASS | Well-structured epics with sized stories and clear ACs |
| 7. Technical Guidance | PASS | Clear technical stack and constraints documented |
| 8. Cross-Functional Requirements | PARTIAL | No data persistence, integrations deferred to post-MVP |
| 9. Clarity & Communication | PASS | Clear language, well-organized, consistent terminology |

### Top Issues by Priority

**BLOCKERS:** None - PRD is sufficient to begin architecture

**HIGH:**
- No quantifiable success metrics (e.g., "60% of users can successfully create a layout in < 5 minutes")
- Missing validation approach for MVP success

**MEDIUM:**
- No competitive analysis or market context
- Security considerations not addressed (even for client-side app)
- No performance baseline measurements

**LOW:**
- User personas implied but not explicitly defined
- Future enhancement roadmap not included

### Recommendations

1. **Add Success Metrics:** Define 3-5 measurable success criteria for MVP validation
2. **Include Basic Security:** Add client-side security considerations (XSS prevention in block code)
3. **Performance Baseline:** Set specific targets (e.g., "grid highlight updates within 16ms")
4. **User Testing Plan:** Brief outline of how to validate MVP with target users
5. **Future Roadmap:** Add section on post-MVP features (persistence, collaboration, export)

## Next Steps

### UX Expert Prompt
Review the DraftCN PRD and create detailed wireframes for the main builder interface, focusing on the drag-and-drop interaction patterns, visual feedback systems, and grid overlay presentation. Pay special attention to the dead zone boundaries and block selection states.

### Architect Prompt
Using the DraftCN PRD as input, create a comprehensive technical architecture document that details the Next.js 15+ App Router structure, Zustand state management patterns, component hierarchy for the builder system, and performance optimization strategies for achieving 60fps during drag operations.
