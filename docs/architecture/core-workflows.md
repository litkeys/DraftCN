# Core Workflows

### Add Block from Library to Canvas

```mermaid
sequenceDiagram
    participant User
    participant Sidebar as Block Library
    participant DragMgr as Drag Manager
    participant GridMgr as Grid Manager
    participant Store as Zustand Store
    participant Canvas
    participant Registry as Block Registry
    participant Renderer as Block Renderer

    User->>Sidebar: Mouse down on template thumbnail
    Sidebar->>Registry: getTemplate(typeId)
    Registry-->>Sidebar: BlockTemplate
    Sidebar->>DragMgr: startDrag('library', template)
    DragMgr->>Store: setDragState({active: true, sourceType: 'library'})

    User->>Canvas: Drag over canvas
    Canvas->>GridMgr: calculateDropPreview(x, y)
    GridMgr-->>Canvas: Grid cells to highlight
    Canvas->>Canvas: Show blue highlight

    User->>Canvas: Mouse up (drop)
    Canvas->>Canvas: Detect drop position from event
    Canvas->>GridMgr: snapToGrid(x, y, altPressed)
    GridMgr-->>Canvas: Snapped position
    Canvas->>Registry: generateBlockInstance(typeId, overrideProps?)
    Registry-->>Canvas: Block instance (or null if not found)
    Canvas->>Store: addBlock(block)
    Store->>Store: Update blocks array
    Store-->>Canvas: State change notification
    Canvas->>Renderer: renderBlock(block)
    Renderer->>Renderer: Execute component code with props
    Canvas->>DragMgr: endDrag()
    DragMgr->>Store: clearDragState()
```

### Reposition Existing Block

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant Block
    participant DragMgr as Drag Manager
    participant GridMgr as Grid Manager
    participant Store as Zustand Store

    User->>Block: Click on block
    Block->>BlocksSlice: handleBlockClick(blockId, event)
    BlocksSlice->>Store: selectBlock(blockId, 'replace')
    Store-->>Canvas: Update selection state
    Canvas->>Block: Show selection highlight

    User->>Block: Mouse down and drag
    Block->>DragMgr: startDrag('canvas', blockId)
    DragMgr->>Store: setDragState({active: true, sourceType: 'canvas'})

    loop During drag
        User->>Canvas: Mouse move
        Canvas->>Block: Update position (follows cursor)
        Canvas->>GridMgr: calculateDropPreview(x, y)
        GridMgr-->>Canvas: Grid cells preview
        Canvas->>Canvas: Show snap preview
    end

    User->>Canvas: Mouse up
    Canvas->>Canvas: Detect final position from event
    Canvas->>GridMgr: snapToGrid(newX, newY, altPressed)
    GridMgr-->>Canvas: Final position
    Canvas->>Store: updateBlock(blockId, {x, y})
    Store->>Store: Update block position
    Store-->>Canvas: State change notification
    Canvas->>Canvas: Re-render at new position
    Canvas->>DragMgr: endDrag()
    DragMgr->>Store: clearDragState()
```

### Delete Selected Blocks (Single or Multiple)

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant Block
    participant Store as Zustand Store
    participant BlocksSlice as Blocks/Selection State
    participant Renderer as Block Renderer

    alt Single Selection
        User->>Block: Click to select
        BlocksSlice->>Store: selectBlock(blockId, 'replace')
    else Multiple Selection
        User->>Block: Ctrl+Click multiple blocks
        BlocksSlice->>Store: selectBlock(blockId, 'toggle')
    end

    BlocksSlice-->>Block: Update selection state
    Block->>Block: Show blue selection border

    User->>User: Press Delete/Backspace key
    User->>Canvas: Keyboard event
    Canvas->>BlocksSlice: getSelectedBlockIds()
    BlocksSlice-->>Canvas: Array of selected blockIds

    loop For each selected block
        Canvas->>Store: removeBlock(blockId)
        Store->>Store: Remove from blocks array
    end

    Canvas->>BlocksSlice: clearSelection()
    BlocksSlice-->>Canvas: Selection cleared
    Store-->>Canvas: State change notification
    Canvas->>Renderer: Remove blocks from DOM
    Renderer-->>Canvas: Blocks removed
    Canvas->>Canvas: Recalculate canvas height
```

### Grid Bypass with Alt Key

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant DragMgr as Drag Manager
    participant GridMgr as Grid Manager
    participant Store as Zustand Store

    User->>Canvas: Start dragging block
    DragMgr->>Store: setDragState({active: true})

    User->>User: Hold Alt key
    User->>Canvas: Alt key down event
    Canvas->>DragMgr: setBypassGrid(true)
    DragMgr->>Canvas: Disable grid preview

    loop While Alt held
        User->>Canvas: Mouse move
        Canvas->>Canvas: Follow cursor exactly
        Note over Canvas: No grid snapping preview
    end

    User->>Canvas: Mouse up (with Alt)
    Canvas->>GridMgr: snapToGrid(x, y, bypass=true)
    GridMgr-->>Canvas: Exact pixel position (no snapping)
    Canvas->>Store: updateBlock(blockId, {x: exactX, y: exactY})
    Store-->>Canvas: State updated

    User->>User: Release Alt key
    Canvas->>DragMgr: setBypassGrid(false)
```

### Multi-Select with Keyboard Modifiers

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant Block
    participant BlocksSlice as Blocks/Selection State
    participant Store as Zustand Store

    Note over User: Ctrl/Cmd + Click Flow
    User->>Block: Ctrl+Click on block A
    BlocksSlice->>Store: selectBlock(blockA, 'toggle')
    Store->>Store: Add to selectedBlockIds
    BlocksSlice-->>Block: Show selection

    User->>Block: Ctrl+Click on block B
    BlocksSlice->>Store: selectBlock(blockB, 'toggle')
    Store->>Store: Add to selectedBlockIds
    BlocksSlice-->>Block: Show selection

    Note over User: Shift + Click Flow (Range)
    User->>Block: Click on block A (without modifier)
    BlocksSlice->>Store: selectBlock(blockA, 'replace')
    Store->>Store: Set as lastSelectedBlockId

    User->>Block: Shift+Click on block C
    BlocksSlice->>Store: selectRange(blockA, blockC)
    Store->>Store: Calculate blocks between A and C
    Store->>Store: Select all blocks in range
    BlocksSlice-->>Canvas: Update all blocks in range
```

### Rectangle Selection (Drag to Select)

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant BlocksSlice as Blocks/Selection State
    participant Store as Zustand Store

    User->>Canvas: Mouse down on empty canvas
    Canvas->>Canvas: Start selection rectangle
    Canvas->>Canvas: Store start position

    loop During drag
        User->>Canvas: Mouse move
        Canvas->>Canvas: Update rectangle size
        Canvas->>Canvas: Render selection overlay
        Canvas->>Canvas: Calculate blocks within bounds
        Canvas->>Canvas: Preview selected blocks
    end

    User->>Canvas: Mouse up
    Canvas->>Canvas: Calculate final bounds
    Canvas->>BlocksSlice: selectWithinBounds(bounds)
    BlocksSlice->>Store: Get all blocks
    BlocksSlice->>BlocksSlice: Filter blocks within bounds
    BlocksSlice->>BlocksSlice: Update selectedBlockIds
    BlocksSlice-->>Canvas: Selection updated
    Canvas->>Canvas: Hide selection rectangle
    Canvas->>Canvas: Show selected blocks
```

### Select All Blocks (Ctrl/Cmd + A)

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant BlocksSlice as Blocks/Selection State
    participant Store as Zustand Store

    User->>User: Press Ctrl/Cmd + A
    User->>Canvas: Keyboard event
    Canvas->>Canvas: Detect selectAll shortcut
    Canvas->>BlocksSlice: selectAll()
    BlocksSlice->>Store: Get all block IDs
    BlocksSlice->>BlocksSlice: Set selectedBlockIds to all blocks
    BlocksSlice-->>Canvas: All blocks selected
    Canvas->>Canvas: Update all block visuals
    Canvas->>Canvas: Show selection count in UI
```

### Bulk Move Operation

```mermaid
sequenceDiagram
    participant User
    participant Canvas
    participant BlocksSlice as Blocks/Selection State
    participant DragMgr as Drag Manager
    participant Store as Zustand Store

    Note over User: Multiple blocks selected
    User->>Canvas: Mouse down on selected block
    Canvas->>BlocksSlice: getSelectedBlockIds()
    BlocksSlice-->>Canvas: Array of selected IDs
    Canvas->>DragMgr: startDrag('canvas', selectedBlockIds)
    DragMgr->>DragMgr: Store drag offset for each block

    loop During drag
        User->>Canvas: Mouse move
        Canvas->>Canvas: Calculate delta from start
        Canvas->>Canvas: Update all selected block positions
        Canvas->>Canvas: Maintain relative positions
    end

    User->>Canvas: Mouse up
    Canvas->>Canvas: Calculate final positions
    loop For each selected block
        Canvas->>Store: updateBlock(blockId, {x, y})
    end
    Canvas->>DragMgr: endDrag()
    DragMgr->>Store: clearDragState()
```

### Template Registration (Development Flow)

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Comp as Component File
    participant Reg as Registry File
    participant Registry as Block Registry
    participant Store as Zustand Store

    Dev->>Comp: Create HeroComponent.tsx
    Dev->>Dev: Add thumbnail to public/thumbnails/

    Note over Dev: Manual registration process

    Dev->>Reg: Open registry.ts
    Dev->>Reg: Import HeroComponent
    Dev->>Reg: Define template object
    Reg->>Reg: Set typeId, name, category
    Reg->>Reg: Set thumbnail path
    Reg->>Reg: Define defaultProps
    Reg->>Reg: Reference component
    Reg->>Reg: Set dimensions

    Dev->>Registry: Call registerTemplate(template)
    Registry->>Registry: Validate template structure
    Registry->>Registry: Add to templates Map
    Registry->>Store: updateAvailableTemplates()
    Store-->>Store: Notify UI of new templates
```
