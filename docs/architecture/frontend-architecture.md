# Frontend Architecture

### Component Architecture

#### Component Organization

```text
components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── badge.tsx
│   ├── scroll-area.tsx
│   ├── accordion.tsx
│   ├── navigation-menu.tsx
│   ├── sheet.tsx
│   └── context-menu.tsx
├── canvas/
│   ├── Canvas.tsx         # Main canvas with integrated block rendering
│   └── DropPreview.tsx    # Drag preview visualization
├── blocks/
│   ├── BlockLibrary.tsx           # Template library sidebar
│   ├── BlockLibraryErrorBoundary.tsx  # Error handling for library
│   └── TemplateCard.tsx           # Template thumbnail card
├── layout/
│   ├── Header.tsx          # App header
│   └── Sidebar.tsx         # Sidebar container
└── shadcnblocks/
    └── logo.tsx            # Logo component
```

#### Canvas Direct Rendering Pattern

```typescript
// Actual implementation - Canvas renders blocks directly
import { useAppStore } from '@/store';
import { blocksSelectors } from '@/store/slices/blocks';
import { blockRegistry } from '@/lib/blocks/registry';

// Complete Canvas Implementation with Event Handlers
// Canvas renders blocks and delegates selection/drag events to appropriate managers

import { useAppStore } from '@/store';
import { blocksSelectors } from '@/store/slices/blocks';
import { selectionSelectors } from '@/store/slices/selection';
import { dragSelectors } from '@/store/slices/drag';
import { blockRegistry } from '@/lib/blocks/registry';
import { useSelectionManager } from '@/hooks/useSelectionManager';
import { useDragManager } from '@/hooks/useDragManager';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { snapToGrid } from '@/lib/grid/calculator';

export const Canvas: React.FC = () => {
  const blocks = useAppStore(blocksSelectors.getAllBlocks);
  const selectedBlockIds = useAppStore(state => state.selectedBlockIds);
  const isActive = useAppStore(state => state.isActive);
  const draggedItem = useAppStore(state => state.draggedItem);
  // Note: dropPreview is no longer part of the drag state - handle preview logic in components

  // Actions
  const addBlock = useAppStore(state => state.addBlock);
  const updateBlock = useAppStore(state => state.updateBlock);
  const removeBlock = useAppStore(state => state.removeBlock);
  const selectBlock = useAppStore(state => state.selectBlock);
  const clearSelection = useAppStore(state => state.clearSelection);
  const selectWithinBounds = useAppStore(state => state.selectWithinBounds);
  const setDragState = useAppStore(state => state.setDragState);
  const clearDragState = useAppStore(state => state.clearDragState);

  // Performance optimization: memoize selection set
  const selectionSet = useMemo(() => new Set(selectedBlockIds), [selectedBlockIds]);

  // Rectangle selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  // Handle block click with modifiers
  const handleBlockClick = useCallback((blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      selectBlock(blockId, 'toggle');
    } else if (e.shiftKey) {
      // Range selection
      const lastSelected = useAppStore.getState().lastSelectedBlockId;
      if (lastSelected) {
        useAppStore.getState().selectRange(lastSelected, blockId);
      } else {
        selectBlock(blockId, 'replace');
      }
    } else {
      // Single selection
      selectBlock(blockId, 'replace');
    }
  }, [selectBlock]);

  // Handle block drag start
  const handleBlockMouseDown = useCallback((blockId: string, e: React.MouseEvent) => {
    e.preventDefault();

    // If block is not selected, select it first
    if (!selectionSet.has(blockId)) {
      selectBlock(blockId, 'replace');
    }

    // Start drag operation
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragState({
        isActive: true,
        draggedItem: selectionSet.size > 1 ? selectedBlockIds : blockId,
        sourceType: 'canvas',
        offset: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      });
    }
  }, [blocks, selectedBlockIds, selectionSet, selectBlock, setDragState]);

  // Handle canvas click (clear selection)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only clear if clicking directly on canvas
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle canvas mouse down (start rectangle selection)
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isActive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      setIsSelecting(true);
      setSelectionRect({
        startX,
        startY,
        endX: startX,
        endY: startY
      });
    }
  }, [isActive]);

  // Handle mouse move for rectangle selection
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSelecting && selectionRect) {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelectionRect({
        ...selectionRect,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top
      });
    }
  }, [isSelecting, selectionRect]);

  // Handle mouse up (complete rectangle selection or drop)
  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    // Handle rectangle selection completion
    if (isSelecting && selectionRect) {
      const bounds = {
        x: Math.min(selectionRect.startX, selectionRect.endX),
        y: Math.min(selectionRect.startY, selectionRect.endY),
        width: Math.abs(selectionRect.endX - selectionRect.startX),
        height: Math.abs(selectionRect.endY - selectionRect.startY)
      };

      if (bounds.width > 5 && bounds.height > 5) {
        selectWithinBounds(bounds);
      }

      setIsSelecting(false);
      setSelectionRect(null);
    }

    // Handle drop from library
    if (isActive && draggedItem && useAppStore.getState().sourceType === 'library') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Snap to grid (unless Alt is held)
      const snapped = snapToGrid(x, y, e.altKey);

      // Create new block instance
      const template = blockRegistry.getTemplate(draggedItem.typeId);
      if (template) {
        const newBlock = {
          id: `${draggedItem.typeId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          typeId: draggedItem.typeId,
          props: template.defaultProps,
          x: snapped.x,
          y: snapped.y,
          width: template.defaultWidth,
          height: template.defaultHeight,
          z: useAppStore.getState().getHighestZIndex() + 1
        };

        addBlock(newBlock);
        selectBlock(newBlock.id, 'replace');
      }

      clearDragState();
    }
  }, [isSelecting, selectionRect, isActive, draggedItem, selectWithinBounds, addBlock, selectBlock, clearDragState]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'Delete': () => {
      selectedBlockIds.forEach(id => removeBlock(id));
      clearSelection();
    },
    'Escape': () => {
      clearSelection();
    },
    'Ctrl+A': (e) => {
      e.preventDefault();
      useAppStore.getState().selectAll();
    },
    'Cmd+A': (e) => {
      e.preventDefault();
      useAppStore.getState().selectAll();
    }
  });

  return (
    <div
      className="relative w-full h-full bg-slate-50 overflow-auto"
      data-canvas
      onClick={handleCanvasClick}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Blocks */}
      {blocks.map((block) => {
        const template = blockRegistry.getTemplate(block.typeId);
        if (!template) return null;

        const Component = template.component;
        if (!Component) return null;

        const isSelected = selectionSet.has(block.id);

        return (
          <div
            key={block.id}
            className={`absolute border rounded cursor-move transition-colors ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
              zIndex: block.z,
            }}
            onClick={(e) => handleBlockClick(block.id, e)}
            onMouseDown={(e) => handleBlockMouseDown(block.id, e)}
            data-block-id={block.id}
            data-testid={`block-${block.id}`}
            data-selected={isSelected}
          >
            <Component {...block.props} />
          </div>
        );
      })}

      {/* Rectangle selection overlay */}
      {isSelecting && selectionRect && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 pointer-events-none"
          style={{
            left: Math.min(selectionRect.startX, selectionRect.endX),
            top: Math.min(selectionRect.startY, selectionRect.endY),
            width: Math.abs(selectionRect.endX - selectionRect.startX),
            height: Math.abs(selectionRect.endY - selectionRect.startY),
            zIndex: 10000
          }}
        />
      )}

      {/* Drop preview */}
      {/* Drop preview logic should be handled in component based on drag position and offset */}
      {isActive && draggedItem && (
        <div
          className="absolute border-2 border-blue-400 bg-blue-100 bg-opacity-30 pointer-events-none rounded"
          style={{
            left: position.x - offset.x,
            top: position.y - offset.y,
            width: 200, // Use appropriate width based on draggedItem
            height: 100, // Use appropriate height based on draggedItem
            zIndex: 9999
          }}
        />
      )}
    </div>
  );
};
```

### State Management Architecture

#### State Structure

```typescript
// Actual Zustand store structure with slices
type AppStore = AppState & AppActions & BlocksSlice & DragSlice & SelectionSlice;

// BlocksSlice - manages blocks
interface BlocksSlice {
  // State
  blocks: Block[];
  
  // Actions
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;  // Note: not deleteBlock
  clearBlocks: () => void;
  getHighestZIndex: () => number;
}

// DragSlice - manages drag operations
interface DragSlice {
  // State
  isActive: boolean;
  sourceType: 'library' | 'canvas' | null;
  draggedItem: any; // The item being dragged (block template or existing block)
  position: {
    x: number;
    y: number;
  };
  offset: {
    x: number;
    y: number;
  };

  // Actions
  setDragState: (state: Partial<DragState>) => void;
  updateDragPosition: (x: number, y: number) => void;
  clearDragState: () => void;
}

// SelectionSlice - manages selection state
interface SelectionSlice {
  // State - using array for persistence compatibility
  selectedBlockIds: string[]; // Array for JSON serialization
  lastSelectedBlockId: string | null;

  // Actions
  selectBlock: (blockId: string, mode?: 'replace' | 'add' | 'toggle') => void;
  deselectBlock: (blockId: string) => void;
  clearSelection: () => void;
  selectMultiple: (blockIds: string[]) => void;
  selectRange: (fromBlockId: string, toBlockId: string) => void;
  selectAll: () => void;
  selectWithinBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

// AppState - global app state
interface AppState {
  initialized: boolean;
}

interface AppActions {
  setInitialized: (initialized: boolean) => void;
}
```

#### State Management Patterns

- **Sliced architecture** - Separate slices for blocks, drag, and selection state
- **Selector patterns** - Dedicated selectors exported from each slice (e.g., `blocksSelectors`, `dragSelectors`, `selectionSelectors`)
- **Direct store access** - Components use `useAppStore` hook with selectors
- **Synchronous updates** - All state updates are synchronous (no async operations)
- **Helper methods** - Utility functions like `getHighestZIndex()` encapsulated in slices
- **Multi-select support** - Centralized selection management via SelectionSlice

### Routing Architecture

#### Route Organization

```text
app/
├── page.tsx                    # Main builder page (only route)
├── layout.tsx                  # Root layout with providers
└── globals.css                 # Global styles for blocks

tests/
└── unit/                       # Unit test directory structure
    ├── components/
    │   ├── blocks/
    │   └── canvas/
    ├── hooks/
    ├── lib/
    ├── store/
    └── types/
```

Since this is a single-page application, there's only one route - the main builder interface.

#### Protected Route Pattern

```typescript
// Not needed for MVP - no authentication
// Future implementation would wrap builder in auth check
```

### Frontend Services Layer

#### API Client Setup

```typescript
// Not needed for MVP - no backend API
// Future implementation would use fetch or axios
```

#### Service Example

#### Selection Selectors

```typescript
// Selection-specific selectors for efficient access
export const selectionSelectors = {
  // Convert array to Set for O(1) lookups
  _getSelectionSet: (state: AppStore) => new Set(state.selectedBlockIds),

  getSelectedBlockIds: (state: AppStore) => state.selectedBlockIds,
  isBlockSelected: (state: AppStore) => {
    const selectionSet = selectionSelectors._getSelectionSet(state);
    return (blockId: string) => selectionSet.has(blockId); // O(1) lookup
  },
  getSelectedBlocks: (state: AppStore) => {
    const selectionSet = selectionSelectors._getSelectionSet(state);
    return state.blocks.filter(block => selectionSet.has(block.id));
  },
  hasSelection: (state: AppStore) => state.selectedBlockIds.length > 0,
  isMultipleSelected: (state: AppStore) => state.selectedBlockIds.length > 1,
  getSelectionBounds: (state: AppStore) => {
    const selectedBlocks = selectionSelectors.getSelectedBlocks(state);
    if (selectedBlocks.length === 0) return null;

    const bounds = {
      minX: Math.min(...selectedBlocks.map(b => b.x)),
      minY: Math.min(...selectedBlocks.map(b => b.y)),
      maxX: Math.max(...selectedBlocks.map(b => b.x + b.width)),
      maxY: Math.max(...selectedBlocks.map(b => b.y + b.height))
    };

    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY
    };
  }
};
```

#### Service Example

```typescript
// Template loading service (currently static)
class TemplateService {
  private templates: Map<string, BlockTemplate> = new Map();
  
  async loadTemplates(): Promise<void> {
    // In MVP: Load bundled templates
    // Future: Fetch from API
    
    const templates = await import('@/templates');
    templates.forEach(template => {
      this.templates.set(template.typeId, template);
    });
  }
  
  getTemplate(typeId: string): BlockTemplate | undefined {
    return this.templates.get(typeId);
  }
  
  getTemplatesByCategory(category: string): BlockTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.category === category);
  }
}

export const templateService = new TemplateService();
```
