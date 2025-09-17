# Epic 1: Core Builder with Freeform Drag & Drop

**Goal:** Establish the foundational builder interface with a working drag-and-drop system that allows users to place, select, move, and delete blocks on a fixed-width canvas without grid constraints. This epic delivers the core interaction model with a predictable 1200px workspace and proves the viability of the visual builder concept.

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
6. Basic layout with logo in top-left, left sidebar (20% width), and main canvas container (80% width) renders correctly
7. Canvas container holds a centered 1200px-wide canvas with visual distinction from container background
8. Project runs locally with npm run dev without errors

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

### Story 1.5: Block Library Sidebar with Template Loading

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

### Story 1.6: Freeform Drag and Drop with Template Instantiation

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

### Story 1.7: Block Selection and Deletion

As a user,  
I want to select and delete blocks,  
so that I can refine my design.

**Acceptance Criteria:**

1. Blocks have no visible border by default
2. Click on block to select it
3. Clicking on one block deselects all other blocks
4. Click on canvas deselects all blocks
5. Selected block shows blue border
6. Blue border persists when block is selected
7. Hovering over a block shows blue border (same style as selected)
8. Backspace or Delete key removes selected block
9. Deleted block removed from state and canvas updates

### Story 1.8: Block Movement on Canvas

As a user,  
I want to reposition blocks after placing them,  
so that I can adjust my layout.

**Acceptance Criteria:**

1. Blocks can be dragged to new position
2. Blocks are automatically selected on drag start
3. Block position updates on drag
4. No previews or ghosts during drag
5. State updates with new position after move
6. Only one block can be dragged at a time

### Story 1.9: Fixed-Width Canvas with Container and Auto-Expansion

As a user,  
I want a fixed-width canvas that is clearly distinguished from its container and expands automatically as I add content,  
so that I have a predictable workspace with unlimited vertical space.

**Acceptance Criteria:**

1. Canvas container takes 80% viewport width with distinct background color
2. Canvas itself is exactly 1200px wide and horizontally centered within container
3. Canvas has minimum height of 1200px
4. Canvas height dynamically calculated based on lowest block position plus 1200px buffer
5. Canvas visually distinguished from container (different background color, subtle border/shadow)
6. Canvas background is white, container background is light gray
7. Blocks can only be dropped within the 1200px canvas boundaries (dead zones are container areas outside canvas)
8. Canvas re-calculates height when blocks are added/moved/removed
9. Scrollable vertically when canvas content exceeds viewport height
