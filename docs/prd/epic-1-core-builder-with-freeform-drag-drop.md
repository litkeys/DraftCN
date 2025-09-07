# Epic 1: Core Builder with Freeform Drag & Drop

**Goal:** Establish the foundational builder interface with a working drag-and-drop system that allows users to place, select, move, and delete blocks on a canvas without grid constraints. This epic delivers the core interaction model and proves the viability of the visual builder concept.

## Story 1.1: Project Setup and Basic Layout
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

## Story 1.2: Block Data Model and Template System
As a developer,  
I want to implement the template-based block architecture,  
so that blocks have reusable templates with customizable instances.

**Acceptance Criteria:**
1. BlockTemplate interface includes (typeId, name, category, thumbnail, dependencies, defaultProps, componentCode, defaultWidth/Height, minimumWidth/Height)
2. Block instance interface includes (id, typeId, props, x, y, width, height, z, selected)
3. Template registry system created to store and manage available templates
4. Template processor extracts dependencies, props, and code from TSX source files
5. At least 3 sample templates created (Hero, Navbar, Footer) as TSX files
6. Registry supports template registration, retrieval by typeId, and instance creation
7. All position values stored in pixels as specified

## Story 1.3: Template Processing Pipeline
As a developer,  
I want to process TSX template files into BlockTemplate objects,  
so that templates can be dynamically registered and used.

**Acceptance Criteria:**
1. Template processor parses TSX source files using TypeScript AST
2. Extracts import statements to build dependencies array
3. Extracts props interface to understand template parameters
4. Extracts default props from component definition
5. Validates template structure before registration
6. Processes multiple templates during build/initialization
7. Error handling for malformed template files

## Story 1.4: Global CSS and Style Management
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

## Story 1.5: Canvas Container with Auto-Expansion
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

## Story 1.6: Block Library Sidebar with Template Loading
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

## Story 1.7: Freeform Drag and Drop with Template Instantiation
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

## Story 1.8: Dead Zones and Boundary Enforcement
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

## Story 1.9: Block Selection and Deletion
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

## Story 1.10: Block Movement on Canvas
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
