# DraftCN Website Builder Technical Specification

## Project Overview

A Next.js website builder with drag-and-drop functionality, 60px grid system, and shadcn/ui components. Focus: barebones core features with logical implementation sequence.

## MVP Scope

-   Drag & drop sections from LEFT sidebar to canvas
-   60px grid with visual guidelines (20 cells wide, 1200px reference)
-   Canvas with bounded auto-expansion and dead zones
-   Block selection and manipulation (move, delete)
-   Alt key grid bypass
-   No persistence - data lost on tab close
-   No text editing, no database, no auth
-   Freeform grid placement with overlap support via z-index

---

## Implementation Sequence

### Phase 1: Grid Foundation

**Priority: Critical - Everything depends on this**

#### 1.1 Grid System Core

**Grid Constants and Utilities**
The system uses a 60-pixel grid as the foundation for all positioning and measurements. Core utilities are needed for converting between grid values and pixel values. A grid-to-pixel converter multiplies grid values by the 60-pixel size constant. A pixel-to-grid converter divides pixel values by the grid size and rounds to the nearest integer for snapping behavior.

**Grid Overlay Component**
The grid overlay renders as a visual guide across the entire canvas. It creates a pattern of light gray lines using CSS background gradients - one set for vertical lines and another for horizontal lines. The overlay is positioned absolutely to cover the entire canvas area and has pointer events disabled so it doesn't interfere with block interactions. The grid pattern visibility can be toggled on/off and should be subtle enough to provide guidance without being distracting.

#### 1.2 Canvas Container

**Dynamic Canvas Sizing**
The canvas container serves as the main workspace occupying 80% of the viewport width. The height is calculated dynamically based on content. The system examines all blocks to find the lowest Y position plus block height, then adds a buffer of 20 grid cells (1200 pixels) below the content to provide workspace. The minimum canvas height should be equivalent to the viewport height.

**Canvas Structure and Layout**
The canvas is centered within a scrollable container with a gray background. It maintains a fixed width while allowing vertical scrolling for longer content. The container handles overflow with auto-scrolling and positions the canvas with horizontal centering. The relative positioning system allows blocks to be positioned absolutely within the canvas boundaries.

**Dead Zone Implementation**
Dead zones appear outside the 20-cell canvas width when the user zooms out far enough. These zones are rendered as semi-transparent red areas to clearly indicate non-droppable regions. The left dead zone extends from the screen edge to the canvas left boundary. The right dead zone extends from the canvas right boundary to the screen edge. The bottom dead zone appears below the calculated canvas height and extends downward.

---

### Phase 2: Section System

**Priority: High - Core content structure**

#### 2.1 Block Data Model

```typescript
interface Block {
	id: string; // Unique identifier for EVERY block instance
	type: string; // Unique identifier for the TYPE of block ('hero-1', 'navbar-2', etc.)
	code: string; // Complete React snippet/component code

	// Position and dimensions in PIXELS
	x: number; // X position in pixels
	y: number; // Y position in pixels
	width: number; // Width in pixels
	height: number; // Height in pixels
	z: number; // Block number (1st block = 1, 2nd block = 2, etc.)

	// Selection state
	selected: boolean;

	thumbnail?: string;
	category: string;
	// Block-specific data can be added here
	content?: any;
	styles?: any;
}
```

#### 2.2 Block Registry

**Template System Architecture**
The block registry maintains a catalog of available block templates that users can drag onto the canvas. Each template defines the default properties for a block type, excluding instance-specific data like ID, position, and selection state. Templates include the block type identifier, complete React code snippet, default dimensions in pixels, category for organization, and thumbnail for visual identification.

**Template Creation Logic**
When creating a new block from a template, the system generates a unique identifier using timestamp and random string combination. X and Y positions are calculated based on the current mouse position snapped to the grid during drop. Both coordinates are treated equally for freeform placement. The block number (z value) is assigned sequentially based on the number of existing blocks plus one.

**Block Registry Structure**
Templates are organized by type identifier with comprehensive metadata. Each entry includes the complete React code as a string, pixel-based dimensions, category classification, and reference to thumbnail images. The registry should support easy addition of new block types and modification of existing templates.

#### 2.3 Dead Zones Component

**Boundary Visualization System**
The dead zone component renders visual indicators for non-interactive canvas areas. These zones become visible when users zoom out to provide project context and clarity. The implementation uses absolutely positioned divs with semi-transparent backgrounds positioned outside the main canvas boundaries.

**Zone Positioning Logic**
Left and right dead zones extend from screen edges to canvas boundaries with full viewport height. The bottom dead zone spans the full viewport width and extends downward from the calculated canvas height. All zones use pointer-events disabled to prevent interference with drag operations while maintaining visual feedback.

#### 2.4 Block Renderer

**Block Display System**
The block renderer handles the visual representation of blocks on the canvas. Each block is rendered as an absolutely positioned container using the block's pixel coordinates. The renderer applies the block's React code content and manages selection visual feedback.

**Positioning and Styling**
Block positioning uses direct pixel values for left, top, width, and height CSS properties. The z-index is set to the block's number for proper stacking order. Selection state triggers visual highlighting with a blue border and semi-transparent background overlay.

**Content Rendering**
Block content is rendered by executing the React code string stored in the block's code property. This allows for dynamic component rendering while maintaining the complete code for each block instance. The system should handle code execution safely and provide error boundaries for malformed code.

---

### Phase 3: State Management

**Priority: High - Needed before drag & drop**

#### 3.1 Builder Store Interface

```typescript
interface BuilderStore {
	blocks: Block[];
	selectedBlockIds: string[];

	// Actions
	addBlock: (templateId: string) => void;
	removeBlock: (id: string) => void;
	selectBlock: (id: string | null) => void;
	moveBlock: (blockId: string, newX: number, newY: number) => void;
}
```

**State Management Architecture**
The builder store manages all canvas state using Zustand for predictable state updates. The store maintains the complete array of blocks and tracks the currently selected block IDs as an array to support both single and multi-select scenarios. All block modifications flow through store actions to ensure consistency and enable future features like undo/redo.

**Block Management Actions**
The addBlock action creates new blocks from templates and appends them to the canvas. Block removal filters the target block from the array and removes it from selectedBlockIds if it was selected. Selection management through selectBlock updates the selectedBlockIds array and toggles the selected property on block instances, supporting both single and multiple selection patterns.

**Block Movement System**
The moveBlock action handles repositioning on the grid. Both X and Y coordinates are validated to ensure the entire block remains within canvas boundaries. Coordinates are clamped between 0 and canvas dimensions minus block dimensions to prevent boundary violations.

**Grid Placement System**
Blocks are placed freely on the grid at the specified X,Y coordinates. The z property determines stacking order when blocks overlap. Higher z values appear above lower values in the visual stack.

---

### Phase 4: Block Library Sidebar

**Priority: High - User needs to see available blocks**

#### 4.1 Block Library Component (LEFT Sidebar)

**Sidebar Layout and Structure**
The block library occupies the left side of the interface with 20% of the viewport width. The sidebar has a white background with a right border and vertical scroll capability for handling large numbers of block templates. The layout includes a header section with the "Blocks" title and a scrollable content area for template items.

**Template Organization**
Block templates are organized and displayed in a vertical list format. Each template is represented by a library item component that shows the template thumbnail, name, and provides drag interaction capability. Templates can be grouped by category for better organization and navigation.

#### 4.2 Block Library Item

**Template Display System**
Each library item displays a visual representation of the block template with thumbnail image, block type name, and category information. The items are styled as interactive cards with hover effects and drag cursor indicators. Thumbnail images are sized consistently and use object-cover for proper aspect ratio maintenance.

**Drag Initialization**
Library items are configured as draggable elements with the template ID stored as data attributes. The drag system is initialized when users begin dragging from library items, setting up the necessary event listeners and drag state management.

---

### Phase 5: Grid Highlight System

**Priority: High - Visual feedback for placement**

#### 5.1 Grid Cell Highlighting

**Grid Highlight Architecture**
During drag operations, the system highlights the grid cells where the block will be placed. The highlight shows the exact area the block will occupy based on its dimensions and the current mouse position snapped to the grid.

**Dynamic Highlight Calculation**
The system continuously tracks mouse position during drag and calculates which grid cells would be occupied if dropped at that position. While the block itself follows the cursor freely without snapping, the grid highlight shows the snapped position where the block will actually be placed. The highlight updates in real-time as the user moves the block across the canvas.

**Visual Feedback System**
Grid cells that will be occupied are highlighted with a semi-transparent overlay. The highlight respects block dimensions and shows the full footprint. Valid placement areas show blue highlighting while invalid positions (outside canvas) show red.

#### 5.2 Canvas with Grid Highlights

**Highlight Integration**
The grid highlight system integrates directly with the canvas grid overlay. Highlights are rendered as an additional layer above the grid but below actual blocks.

**Highlight State Management**
During drag operations, the system maintains the current highlight position and updates the visual representation. The highlight automatically snaps to grid boundaries unless Alt key is pressed for pixel-precise placement.

---

### Phase 6: Drag & Drop Implementation

**Priority: High - Core interaction**

#### 6.1 Drag Manager System

**Drag State Management**
The drag manager maintains comprehensive state during drag operations including the template ID being dragged, current drag status, and mouse position tracking. The system uses custom drag implementation rather than HTML5 drag-and-drop for better control over the user experience.

**Drag Initialization Process**
Drag operations begin when users mouse down on library items. The system captures the template ID, creates necessary event listeners for mouse movement and release, and initializes visual feedback systems. The drag state includes references to the original element and current mouse coordinates.

**Mouse Movement Tracking**
During drag operations, the system continuously tracks mouse position for two purposes: the dragged block follows the cursor freely for smooth interaction, while grid highlights show the snapped position where the block will be placed on drop. Mouse movement handlers calculate both X and Y coordinates relative to the canvas and update grid cell highlighting based on where the block would snap. The system debounces rapid mouse movements for performance optimization.

**Drop Detection and Execution**
Drop detection occurs on mouse release by calculating the final grid position based on current mouse coordinates. When dropped within canvas boundaries, the system snaps the coordinates to the grid and calls the block creation system with the template ID and calculated X,Y position. Invalid drops outside canvas boundaries are ignored and drag state is cleaned up.

**Cleanup and State Reset**
The drag manager includes comprehensive cleanup logic to remove event listeners, reset visual states, and clear drag-related data. Cleanup occurs on successful drops, cancelled operations, and error conditions to prevent memory leaks and state corruption.

#### 6.2 Grid Cell Highlighting

**Dynamic Highlighting System**
The grid cell highlighting system provides real-time visual feedback during drag operations. The system calculates which grid cells would be occupied based on the mouse position and block dimensions. Cells within the block footprint receive highlight styling showing where the block will be placed.

**Performance Optimization**
Highlighting calculations are optimized to minimize performance impact during rapid mouse movements. The system uses efficient DOM queries, caches bounding rectangle calculations where possible, and applies class-based styling changes rather than direct style manipulation.

---

### Phase 7: Drag & Drop Polish

**Priority: Medium - Enhanced interactions**

#### 7.1 Builder Layout

**Overall Application Structure**
The builder layout organizes the interface into distinct functional areas with a logo in the top left corner, left sidebar for blocks (20% width), and main canvas area (80% width). The layout uses flexbox for responsive behavior and proper space distribution. No additional action buttons or toolbar are present in the MVP - only the logo for branding.

**Keyboard Event Integration**
The main layout includes global keyboard event listeners for block deletion. The system listens for Backspace and Delete key presses and triggers the removeBlock action for each ID in selectedBlockIds. Keyboard events are properly managed with cleanup on component unmount.

**Layout Responsiveness**
The layout system handles different screen sizes and maintains usability across various viewport dimensions. The sidebar maintains fixed width while the canvas area grows to fill available space. Overflow handling ensures proper scrolling behavior for large canvases.

---

### Phase 8: Main Layout

**Priority: Medium - Putting it all together**

_Note: No persistence - all data is lost when tab closes_

**Integration and Assembly**
The final phase involves integrating all components into a cohesive application. This includes proper component hierarchy, state flow between components, and overall user experience refinement. The system ensures all features work together seamlessly without conflicts.

**Error Handling and Edge Cases**
The assembled application includes comprehensive error handling for edge cases like invalid drag operations, boundary violations, and malformed block templates. Error boundaries prevent application crashes and provide graceful fallback behavior.

---

## File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── builder/
│       ├── Canvas.tsx         # Main canvas (Phase 1)
│       ├── GridOverlay.tsx    # Grid system (Phase 1)
│       ├── BlockLibrary.tsx   # Sidebar (Phase 4)
│       ├── BlockRenderer.tsx  # Block display (Phase 2)
│       ├── GridHighlight.tsx  # Grid highlighting (Phase 5)
│       └── BuilderLayout.tsx  # Main layout (Phase 8)
├── blocks/                    # Available blocks
│   ├── Hero1.tsx
│   ├── Navbar1.tsx
│   └── Footer1.tsx
├── hooks/
│   └── useDragManager.ts      # Drag & drop (Phase 6)
├── lib/
│   ├── store.ts               # Zustand store (Phase 3)
│   └── block-registry.ts      # Block registry (Phase 2)
└── app/
    └── builder/
        └── page.tsx           # Main page (Phase 7)
```

---

## Implementation Notes

### Key Decisions

1. **Responsive Canvas Width**: 80% of viewport width (20 cells × 60px = 1200px reference) with dead zones beyond
2. **Freeform Placement**: Blocks can be placed anywhere on the grid with overlap support
3. **Block Selection**: Click to select, visual highlight, keyboard deletion
4. **Bounded Auto-Expansion**: Canvas grows with content + buffer, dead zones when zoomed out
5. **LEFT Sidebar**: Block library positioned on left side of canvas
6. **Simple Drag**: Custom implementation, no external library
7. **No Text Editing**: Blocks are static components
8. **Grid Always Visible**: Continuous visual guide
9. **Grid Movement**: Blocks can be repositioned anywhere on the grid (both X and Y)
10. **Free Positioning**: Blocks can be placed at any valid grid position within canvas boundaries

### Alt Key Bypass

The system includes alt key bypass functionality for grid snapping. When users hold the Alt key during drag operations, the positioning system bypasses grid snapping and allows free pixel-level positioning. The system detects the alt key state from mouse event handlers and passes bypass flags to positioning calculation functions.

### Grid Snapping Logic

Grid snapping ensures blocks align to the 60-pixel grid system for consistent layouts. During drag operations, blocks move freely following the cursor for smooth interaction, while the grid highlight preview shows where the block will snap when dropped. The snapping algorithm only applies when dropping (on mouse release), rounding positions to the nearest grid cell boundary unless Alt bypass mode is active. This approach provides fluid dragging with predictable grid-aligned placement.

### Performance Considerations

-   Memoize block components to prevent unnecessary re-renders
-   Use CSS transforms for smooth drag previews
-   Minimize DOM queries during drag operations
-   Optimize rendering order based on block z-index (z attribute)

### Boundary Enforcement

**Position Validation System**
Block position validation ensures blocks remain within canvas boundaries at all times. The validation system checks both X and Y coordinates against canvas dimensions and prevents positioning that would place blocks outside valid areas. X coordinate validation ensures blocks don't exceed the 20-cell width limit. Y coordinate validation prevents negative positioning above the canvas origin.

**Dead Zone Detection**
Dead zone detection identifies when drag operations or block positioning attempts occur outside the valid canvas area. The detection system uses coordinate comparison against canvas boundaries and provides immediate feedback to prevent invalid placements. Dead zone boundaries are clearly defined as areas beyond the 20-cell width or below the calculated canvas height.

### Block Movement System

**Grid-Based Movement**
Block movement allows free positioning anywhere on the canvas grid. The system calculates new X and Y positions based on drag deltas and snaps to grid unless Alt key is pressed. Movement validation ensures blocks don't extend beyond canvas boundaries by checking that X + width ≤ canvas width and Y + height ≤ canvas height.

**Overlap Support**
Blocks can overlap, with the z property determining stacking order. Higher z values appear above lower values. The system maintains z-index consistency across all operations.

**Movement Constraints and Validation**
The movement system enforces constraints to maintain blocks within canvas boundaries. Both X and Y movement are constrained to keep the entire block within the canvas area. Grid snapping ensures consistent 60px alignment unless bypassed with Alt key. All movement operations include boundary validation to prevent blocks from extending outside the canvas.

### Future Enhancements (Not in MVP)

-   Zoom controls for better dead zone visibility
-   Advanced layout features
-   Block duplication
-   Undo/redo functionality
-   Export to code
-   Custom block templates
-   Multi-select operations
