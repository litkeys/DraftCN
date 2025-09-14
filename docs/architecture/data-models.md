# Data Models

### Block

**Purpose:** Represents an individual draggable UI component instance on the canvas with complete positioning, rendering information, and customized content.

**Key Attributes:**
- `id: string` - Unique identifier for every block instance
- `typeId: string` - References the block template type (e.g., "hero-1")
- `props: any` - Customized content following template's props interface
- `x: number` - Horizontal position in pixels
- `y: number` - Vertical position in pixels
- `width: number` - Block width in pixels
- `height: number` - Block height in pixels
- `z: number` - Stacking order (1 = first block added)
- `selected: boolean` - Whether the block is currently selected

#### TypeScript Interface
```typescript
interface Block {
  id: string;
  typeId: string;
  props: any; // Matches template's specific props interface
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  selected: boolean;
}
```

#### Relationships
- References a BlockTemplate via typeId
- Props must conform to template's interface structure
- Z-index determines visual stacking when blocks overlap

#### Selection Architecture Note
The `selected` field in Block is initialized as `false` when blocks are created but is **not actively maintained**. Selection state is managed by the SelectionSlice which maintains a `selectedBlockIds` array. This approach:
- Avoids updating every block when selection changes (performance)
- Keeps selection logic centralized in SelectionSlice
- Allows for efficient multi-select operations
- The `selected` field exists for potential future use or serialization

### BlockTemplate

**Purpose:** Defines reusable block blueprints with their dependencies, default props, and rendering code.

**Key Attributes:**
- `typeId: string` - Unique template identifier (e.g., "hero-1")
- `name: string` - Display name for the template
- `category: string` - Template category for grouping
- `thumbnail: string` - Base64 or URL for preview image
- `dependencies: string[]` - Required npm packages/imports extracted from imports
- `defaultProps: any` - Example content for initial rendering
- `component: React.ComponentType<any>` - The React component for rendering
- `defaultWidth: number` - Initial width in pixels
- `defaultHeight: number` - Initial height in pixels
- `minimumWidth: number` - Minimum allowed width for resizing
- `minimumHeight: number` - Minimum allowed height for resizing

#### TypeScript Interface
```typescript
interface BlockTemplate {
  typeId: string;
  name: string;
  category: string;
  thumbnail: string;
  dependencies: string[];
  defaultProps: any;
  component: React.ComponentType<any>;
  defaultWidth: number;
  defaultHeight: number;
  minimumWidth: number;
  minimumHeight: number;
}
```

#### Relationships
- Templates are instantiated to create Block instances
- Global CSS file assumed to contain all required styles
- Dependencies list extracted from import statements

### BlockRegistry

**Purpose:** Manages the collection of available block templates and provides template instantiation utilities.

#### TypeScript Interface
```typescript
interface BlockRegistry {
  templates: Map<string, BlockTemplate>;
  categories: string[];
  
  // Methods for template management
  registerTemplate(template: BlockTemplate): void;
  getTemplate(typeId: string): BlockTemplate | undefined;
  getTemplatesByCategory(category: string): BlockTemplate[];
  generateBlockInstance(typeId: string, props?: any): Block;
}
```

### Template Registration

**Purpose:** Manual registration of block templates in the central registry.

#### Registration Structure
```typescript
// Example of manually registering a template
const heroTemplate: BlockTemplate = {
  typeId: 'hero-1',
  name: 'Hero Section',
  category: 'Heroes',
  thumbnail: '/thumbnails/hero-1.png',
  dependencies: ['@/components/ui/button'],
  defaultProps: {
    title: 'Welcome to Our Site',
    subtitle: 'Build amazing websites visually',
    buttonText: 'Get Started'
  },
  component: HeroComponent,
  defaultWidth: 1200,
  defaultHeight: 400,
  minimumWidth: 600,
  minimumHeight: 200
};

// Register the template
registry.registerTemplate(heroTemplate);
```

### Methods for Block Template Development

#### 1. Manual Template Registration
```typescript
// Step 1: Create your React component
import { Button } from '@/components/ui/button';

const HeroComponent = ({ title, subtitle, buttonText }) => {
  return (
    <div className="hero-section">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <Button>{buttonText}</Button>
    </div>
  );
};

// Step 2: Register the template in the registry
const heroTemplate: BlockTemplate = {
  typeId: 'hero-1',
  name: 'Hero Section',
  category: 'Heroes',
  thumbnail: '/thumbnails/hero-1.png',
  dependencies: ['@/components/ui/button'],
  defaultProps: {
    title: 'Welcome',
    subtitle: 'Build amazing websites',
    buttonText: 'Get Started'
  },
  component: HeroComponent,
  defaultWidth: 1200,
  defaultHeight: 400,
  minimumWidth: 600,
  minimumHeight: 200
};

// Step 3: Add to registry
blockRegistry.registerTemplate(heroTemplate);
```

#### 2. Block Instance Creation
```typescript
function createBlockInstance(
  typeId: string,
  position: { x: number; y: number },
  customProps?: any
): Block {
  const template = blockRegistry.getTemplate(typeId);
  if (!template) throw new Error(`Template ${typeId} not found`);
  
  const props = customProps || template.defaultProps;
  
  return {
    id: `${typeId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    typeId,
    props,
    x: snapToGrid(position.x),
    y: snapToGrid(position.y),
    width: template.defaultWidth,
    height: template.defaultHeight,
    z: getNextZIndex()
  };
}
```

#### 3. Adding New Templates - Step by Step

**Step 1: Create Your Component**
Create a new React component file in `templates/` folder:

```typescript
// templates/navbar/NavbarComponent.tsx
import { Button } from '@/components/ui/button';

interface NavbarProps {
  logo: string;
  links: Array<{ label: string; href: string; }>;
}

const NavbarComponent = ({ logo, links }: NavbarProps) => {
  return (
    <nav className="navbar">
      <div className="logo">{logo}</div>
      <ul className="nav-links">
        {links.map(link => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export { NavbarComponent };
```

**Step 2: Add Template to Registry**
In `lib/blocks/registry.ts`, add your template:

```typescript
import { NavbarComponent } from '@/templates/navbar/NavbarComponent';

const navbarTemplate: BlockTemplate = {
  typeId: 'navbar-1',
  name: 'Navigation Bar',
  category: 'Navigation',
  thumbnail: '/thumbnails/navbar-1.png',
  dependencies: ['@/components/ui/button'],
  defaultProps: {
    logo: 'MyApp',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  component: NavbarComponent,
  defaultWidth: 1200,
  defaultHeight: 80,
  minimumWidth: 800,
  minimumHeight: 60
};

// Register the template
registry.registerTemplate(navbarTemplate);
```

**Step 3: Add Thumbnail**
Place a preview image at `public/thumbnails/navbar-1.png`

**Step 4: Add Styles (if needed)**
Add any required styles to `app/globals.css`:

```css
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e5e5;
}
```

### Store Architecture - Sliced Pattern

The application uses Zustand with a sliced pattern for state management, separating concerns into distinct slices:

#### BlocksSlice

```typescript
// State
interface BlocksState {
  blocks: Block[];
}

// Actions
interface BlocksActions {
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  clearBlocks: () => void;
  getHighestZIndex: () => number;
}

// Combined type
type BlocksSlice = BlocksState & BlocksActions;
```

#### DragSlice

```typescript
// State
interface DragState {
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
}

// Actions
interface DragActions {
  setDragState: (state: Partial<DragState>) => void;
  updateDragPosition: (x: number, y: number) => void;
  clearDragState: () => void;
}

// Combined type
type DragSlice = DragState & DragActions;

// Helper selectors
const dragSelectors = {
  isDragging: (state: DragSlice) => state.isActive,
  getDraggedItem: (state: DragSlice) => state.draggedItem,
  getDragPosition: (state: DragSlice) => state.position,
  getDragOffset: (state: DragSlice) => state.offset,
  getDragSource: (state: DragSlice) => state.sourceType,
};
```

#### AppStore (Combined Store)

```typescript
interface AppState {
  initialized: boolean;
}

interface AppActions {
  setInitialized: (initialized: boolean) => void;
}

type AppStore = AppState & AppActions & DragSlice & BlocksSlice & SelectionSlice;
```

#### SelectionSlice

**Purpose:** Centralized management of block selection state, supporting both single and multi-select operations.

```typescript
// State
interface SelectionState {
  selectedBlockIds: string[]; // Array for persistence/serialization
  lastSelectedBlockId: string | null; // For shift-click range selection
  // Internal: Use Set for O(1) lookups in selectors
  _selectedSet?: Set<string>; // Derived from array in selectors
}

// Actions
interface SelectionActions {
  // Core selection operations
  selectBlock: (blockId: string, mode?: 'replace' | 'add' | 'toggle') => void;
  deselectBlock: (blockId: string) => void;
  clearSelection: () => void;

  // Multi-select operations
  selectMultiple: (blockIds: string[]) => void;
  selectRange: (fromBlockId: string, toBlockId: string) => void;
  selectAll: () => void;

  // Rectangle selection
  selectWithinBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;

}

// Combined type
type SelectionSlice = SelectionState & SelectionActions;
```

#### Selection Patterns

1. **Single Selection**
   - Click on block: Replace current selection
   - Click on canvas: Clear selection

2. **Multi-Selection**
   - Ctrl/Cmd + Click: Toggle individual block
   - Shift + Click: Select range between last and current
   - Ctrl/Cmd + A: Select all blocks
   - Drag rectangle: Select blocks within bounds
