# Frontend Architecture

## Component Architecture

### Component Organization

```text
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   └── scroll-area.tsx
│   ├── canvas/
│   │   ├── Canvas.tsx         # Main canvas component
│   │   ├── Grid.tsx           # Grid overlay
│   │   ├── DeadZones.tsx      # Boundary indicators
│   │   └── DropPreview.tsx    # Drag preview
│   ├── blocks/
│   │   ├── BlockRenderer.tsx  # Dynamic block rendering
│   │   ├── BlockWrapper.tsx   # Selection/positioning wrapper
│   │   └── BlockInstance.tsx  # Individual block instance
│   ├── sidebar/
│   │   ├── BlockLibrary.tsx   # Template library sidebar
│   │   ├── TemplateCard.tsx   # Template thumbnail card
│   │   └── CategoryFilter.tsx # Category organization
│   └── layout/
│       ├── Header.tsx          # App header with logo
│       └── Layout.tsx          # Main layout wrapper
```

### Component Template

```typescript
// Example component structure
import { memo, useCallback } from 'react';
import { useStore } from '@/store';
import { Block } from '@/types';

interface BlockInstanceProps {
  block: Block;
  template: BlockTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
}

export const BlockInstance = memo(({ 
  block, 
  template, 
  isSelected,
  onSelect,
  onMove 
}: BlockInstanceProps) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(block.id);
    // Initiate drag logic
  }, [block.id, onSelect]);

  return (
    <div
      className={cn(
        "absolute",
        isSelected && "ring-2 ring-blue-500"
      )}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
        zIndex: block.z
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Render block content */}
    </div>
  );
});
```

## State Management Architecture

### State Structure

```typescript
interface BuilderState {
  // Canvas state
  canvas: {
    width: number;
    height: number;
    gridSize: number;
    showGrid: boolean;
  };
  
  // Blocks state
  blocks: Block[];
  selectedBlockId: string | null;
  
  // Drag state
  drag: {
    isActive: boolean;
    sourceType: 'library' | 'canvas' | null;
    draggedItem: any;
    position: { x: number; y: number };
    offset: { x: number; y: number };
  };
  
  // Templates state
  templates: Map<string, BlockTemplate>;
  categories: string[];
  
  // Actions
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  startDrag: (source: 'library' | 'canvas', item: any) => void;
  updateDragPosition: (x: number, y: number) => void;
  endDrag: () => void;
}
```

### State Management Patterns

- **Atomic updates** - Each action updates minimal state
- **Selector patterns** - Components subscribe to specific state slices
- **Memoization** - Heavy computations cached with useMemo
- **Optimistic updates** - UI updates immediately, no async waits

## Routing Architecture

### Route Organization

```text
app/
├── page.tsx                    # Main builder page (only route)
├── layout.tsx                  # Root layout with providers
└── globals.css                 # Global styles for blocks
```

Since this is a single-page application, there's only one route - the main builder interface.

### Protected Route Pattern

```typescript
// Not needed for MVP - no authentication
// Future implementation would wrap builder in auth check
```

## Frontend Services Layer

### API Client Setup

```typescript
// Not needed for MVP - no backend API
// Future implementation would use fetch or axios
```

### Service Example

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
