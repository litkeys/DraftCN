# Epic 2: Grid System with Smart Snapping

**Goal:** Enhance the builder with a 60px grid system that provides visual guidance and automatic snapping for precise, professional layouts. This epic transforms the freeform builder into a production-ready tool with predictable placement and alignment.

## Story 2.1: Grid Overlay Implementation
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

## Story 2.2: Grid Snapping on Drop
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

## Story 2.3: Drop Zone Preview
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

## Story 2.4: Grid Snapping for Movement
As a user,  
I want blocks to snap to grid when repositioning them,  
so that all blocks maintain alignment.

**Acceptance Criteria:**
1. When moving existing blocks, position snaps to grid on release
2. During drag, block follows cursor freely (smooth movement)
3. Preview highlight shows where block will snap
4. Snapping respects block dimensions and canvas boundaries
5. Z-index preserved during grid-snapped movement

## Story 2.5: Alt Key Grid Bypass
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
