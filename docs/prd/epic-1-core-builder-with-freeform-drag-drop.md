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

### Story 1.10: Library Sidebar Search Functionality

As a user,
I want to search for block templates by typing keywords,
so that I can quickly find the blocks I need without scrolling through categories.

**Acceptance Criteria:**

1. Search bar positioned at top of library sidebar, below any header/title
2. Search input field has placeholder text "Search blocks..."
3. Search is case-insensitive and matches against template typeId, names, and categories
4. Results filter in real-time as user types (no need to press Enter)
5. Matching templates displayed below search bar, maintaining category grouping
6. Non-matching templates hidden from view
7. Clear/X button appears in search field when text is entered
8. Clicking clear button or deleting all text restores full template list
9. Search maintains visual consistency with existing sidebar design
10. Empty search results show message "No blocks found"
11. Search persists during drag operations (doesn't clear when dragging blocks)

### Story 1.11: Canvas Zoom Control

As a user,
I want to adjust the zoom level of the canvas using a slider in the navigation bar,
so that I can zoom in for detailed work or zoom out to see the full design.

**Acceptance Criteria:**

1. Zoom control slider positioned in the center of the top navigation bar
2. Slider shows current zoom percentage (e.g., "100%") as a label next to the slider
3. Zoom range from 25% minimum to 200% maximum
4. Default zoom level is 100% (actually renders at 0.8 scale for better viewport fit)
5. Slider has discrete steps: 25%, 50%, 75%, 100%, 125%, 150%, 175%, 200%
   - 100% = 0.8 scale (default, fits more content)
   - 125% = 1.0 scale (true 1:1)
   - Scale calculation: actualScale = zoom \* 0.8
6. Canvas uses world coordinate system with transform-based rendering:
   - Backend/state stores only world-space block data (x, y, width, height in fixed pixels)
   - Frontend maintains single zoom factor and pan offset (panX, panY) in global state
   - No zoom information stored with document data
7. Input event handling uses inverse transform for world coordinates:
   - Mouse/touch to world: `worldX = (screenX - panX) / zoom`, `worldY = (screenY - panY) / zoom`
   - Coordinate origin (0, 0) at top-left of canvas container
   - All drag, drop, and selection operations work in world space
8. Rendering applies forward transform from world to screen coordinates:
   - Screen position: `screenX = worldX * zoom + panX`, `screenY = worldY * zoom + panY`
   - Block dimensions: `screenWidth = worldWidth * zoom`, `screenHeight = worldHeight * zoom`
   - Rendering context multiplies by zoom factor when drawing blocks
9. Block previews during drag operations render at current zoom level using world coordinate transforms
10. When zoomed in beyond container width, horizontal scrollbar appears at bottom of canvas container (container-based scrolling)
11. Block drag and drop from library sidebar uses world coordinate conversion for accurate placement at any zoom level
12. Block selection and movement on canvas operate in world space, ensuring consistent behavior across zoom levels
13. Client can render document at any zoom level without modifying underlying world-space data
14. Text rendering scales proportionally with zoom (text sizes stored in world units)

### Story 1.12: Project Import and Export Functionality

As a user,
I want to export my project as a JSON file and import previously exported projects,
so that I can save my work externally and share or restore projects across sessions.

**Acceptance Criteria:**

1. Export button positioned on the right side of the top navigation bar
2. Import button positioned immediately to the left of the Export button
3. Both buttons styled consistently with existing navigation bar elements
4. Export button click triggers a dropdown/modal with export options:
   - Currently shows single option: "Export as JSON"
   - Dropdown designed to accommodate future export formats
5. Selecting "Export as JSON" generates a downloadable JSON file containing:
   - All block instances with their complete state (id, typeId, props, x, y, width, height, z, selected)
   - Canvas dimensions and configuration
   - Project metadata (export timestamp)
6. JSON file downloads with descriptive filename: `draftcn-project-[YYYY-MM-DD-HHmmss].json`
7. Import button click opens file picker dialog restricted to .json files
8. Upon selecting a valid JSON file:
   - File contents validated for correct structure and required fields
   - Confirmation dialog shown: "This will replace your current project. Continue?"
   - On confirmation, existing project state completely replaced with imported data
   - All blocks cleared and recreated from imported data
   - Canvas updates to reflect imported project state
9. Import validation handles:
   - Invalid JSON format with error message "Invalid file format"
   - Missing required fields with error message "Incomplete project data"
   - Corrupted data gracefully without crashing application
10. Import preserves all block properties including positions, dimensions, and z-ordering
11. After successful import, success notification shown: "Project imported successfully"
12. Export/Import operations do not affect zoom level or pan position (UI state remains separate from project data)

### Story 1.13: Export to React Project

As a user,
I want to export my design as a minimal React project,
so that I can have a working codebase that preserves my exact layout for further development.

**Acceptance Criteria:**

1. Export button in top navigation bar (right side) includes "Export to React" option in dropdown menu
2. Selecting "Export to React" triggers the export process that generates a minimal React project structure
3. Export process creates the following project structure in a ZIP file:
   - `/src` folder containing:
     - `/components` subfolder with all used block template components as individual React files
     - `App.js` main application component that renders all blocks with absolute positioning
     - `index.js` React entry point that renders the App component
     - `globals.css` file (provided manually during implementation) containing all theming, fonts, and CSS custom properties
   - `index.html` HTML shell with proper React mounting point (at project root)
   - `package.json` with minimal required dependencies including:
     - React and React-DOM (latest stable)
     - Standard Tailwind CSS (no custom config needed)
     - Vite build tools for fast development and optimized production builds
4. Component generation process:
   - Each block instance maps to its corresponding React component template
   - Component files copied with exact template code and proper imports
   - Props from block instances passed to components during rendering
   - Block Y positioning preserved, X positioning ignored for full-width layout
5. Layout assembly in App.js:
   - Imports all used components from `/components` folder
   - Sorts blocks by Z-index to maintain creation/layer order from canvas
   - Renders each block in a positioned div with responsive width styling:
     - `position: 'absolute'`, `top: '${block.y}px'`, `left: 0`, `right: 0`
     - `width: '100%'` to span full viewport width (ignores block width)
     - `height: '${block.height}px'` to preserve original block height
   - Full-width responsive design replaces fixed 1200px canvas constraint
6. Styling approach:
   - No `tailwind.config.js` required - uses standard Tailwind classes
   - `globals.css` (provided manually, copied to `/src/globals.css`) includes all CSS custom properties for theming (colors, fonts, shadows)
   - `globals.css` imported in `index.js` for optimal loading order before component rendering
   - shadcn/ui components work with standard Tailwind + CSS variables
   - Google Fonts imports preserved in globals.css for typography
7. README.md file included with:
   - Quick start: "Run `npm install && npm run dev` to view your exported design"
   - Project structure explanation:
     - How components are organized in `/src/components`
     - How positioning works in `App.js`
     - How to customize styling via `/src/globals.css`
     - Note that `globals.css` is imported in `index.js` for proper CSS loading order
   - Notes about converting to responsive layout if desired
8. Export generates a ZIP file with descriptive name: `draftcn-react-export-[YYYY-MM-DD-HHmmss].zip`
9. ZIP file automatically downloads upon generation
10. Export process shows loading indicator during generation
11. Success notification displayed: "React project exported successfully"
12. Error handling for:
    - Missing template definitions with graceful fallback
    - Component generation failures with detailed error messages
    - ZIP creation errors with retry option
