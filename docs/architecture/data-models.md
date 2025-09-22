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
  id: string
  typeId: string
  props: any // Matches template's specific props interface
  x: number
  y: number
  width: number
  height: number
  z: number
  selected: boolean
}
```

#### Relationships

- References a BlockTemplate via typeId
- Props must conform to template's interface structure
- Z-index determines visual stacking when blocks overlap

#### Selection Architecture Note

The `selected` field in Block works in conjunction with BlocksSlice's `selectedBlockIds` array using a dual-state approach:

- **`selectedBlockIds` array** - Single source of truth maintained by BlocksSlice
- **`block.selected` boolean** - Synchronized field on each block for efficient rendering
- When selection changes, BlocksSlice updates both the array and individual block fields
- Components render based on the `selected` field for optimal performance
- This approach centralizes selection logic while maintaining rendering efficiency

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
  typeId: string
  name: string
  category: string
  thumbnail: string
  dependencies: string[]
  defaultProps: any
  component: React.ComponentType<any>
  defaultWidth: number
  defaultHeight: number
  minimumWidth: number
  minimumHeight: number
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
  templates: Map<string, BlockTemplate>
  categories: string[]

  // Methods for template management
  registerTemplate(template: BlockTemplate): void
  getTemplate(typeId: string): BlockTemplate | undefined
  getTemplatesByCategory(category: string): BlockTemplate[]
  generateBlockInstance(typeId: string, props?: any): Block
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
    buttonText: 'Get Started',
  },
  component: HeroComponent,
  defaultWidth: 1200,
  defaultHeight: 400,
  minimumWidth: 600,
  minimumHeight: 200,
}

// Register the template
registry.registerTemplate(heroTemplate)
```

### Methods for Block Template Development

#### 1. Manual Template Registration

```typescript
// Step 1: Create your React component
import { Button } from '@/components/ui/button'

const HeroComponent = ({ title, subtitle, buttonText }) => {
  return (
    <div className="hero-section">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <Button>{buttonText}</Button>
    </div>
  )
}

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
    buttonText: 'Get Started',
  },
  component: HeroComponent,
  defaultWidth: 1200,
  defaultHeight: 400,
  minimumWidth: 600,
  minimumHeight: 200,
}

// Step 3: Add to registry
blockRegistry.registerTemplate(heroTemplate)
```

#### 2. Block Instance Creation

```typescript
function createBlockInstance(
  typeId: string,
  position: { x: number; y: number },
  customProps?: any
): Block {
  const template = blockRegistry.getTemplate(typeId)
  if (!template) throw new Error(`Template ${typeId} not found`)

  const props = customProps || template.defaultProps

  return {
    id: `${typeId}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`,
    typeId,
    props,
    x: snapToGrid(position.x),
    y: snapToGrid(position.y),
    width: template.defaultWidth,
    height: template.defaultHeight,
    z: getNextZIndex(),
  }
}
```

#### 3. Adding New Templates - Step by Step

**Step 1: Create Your Component**
Create a new React component file in `templates/` folder:

```typescript
// templates/navbar/NavbarComponent.tsx
import { Button } from '@/components/ui/button'

interface NavbarProps {
  logo: string
  links: Array<{ label: string; href: string }>
}

const NavbarComponent = ({ logo, links }: NavbarProps) => {
  return (
    <nav className="navbar">
      <div className="logo">{logo}</div>
      <ul className="nav-links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { NavbarComponent }
```

**Step 2: Add Template to Registry**
In `lib/blocks/registry.ts`, add your template:

```typescript
import { NavbarComponent } from '@/templates/navbar/NavbarComponent'

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
      { label: 'Contact', href: '/contact' },
    ],
  },
  component: NavbarComponent,
  defaultWidth: 1200,
  defaultHeight: 80,
  minimumWidth: 800,
  minimumHeight: 60,
}

// Register the template
registry.registerTemplate(navbarTemplate)
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

**Purpose:** Manages all block instances and their selection state in a unified slice.

```typescript
// State
interface BlocksState {
  blocks: Block[]
  selectedBlockIds: string[] // Array of selected block IDs
}

// Actions
interface BlocksActions {
  // Block management
  addBlock: (block: Block) => void
  updateBlock: (id: string, updates: Partial<Block>) => void
  removeBlock: (id: string) => void
  clearBlocks: () => void
  getHighestZIndex: () => number

  // Selection management
  selectBlock: (blockId: string) => void
  clearSelection: () => void
}

// Combined type
type BlocksSlice = BlocksState & BlocksActions

// Helper selectors
const blocksSelectors = {
  getAllBlocks: (state: BlocksSlice) => state.blocks,
  getBlockById: (state: BlocksSlice, id: string) =>
    state.blocks.find((block) => block.id === id),
  getSelectedBlockIds: (state: BlocksSlice) => state.selectedBlockIds,
  hasSelection: (state: BlocksSlice) => state.selectedBlockIds.length > 0,
  isBlockSelected: (state: BlocksSlice, blockId: string) =>
    state.selectedBlockIds.includes(blockId),
}
```

#### Selection Architecture

**Dual-State Approach:** BlocksSlice maintains selection state in two places for optimal performance:

- **`selectedBlockIds` array** - Single source of truth for selection, used for persistence and operations
- **`block.selected` boolean** - Synchronized field on each block for efficient rendering

**Selection Synchronization:** When `selectBlock()` or `clearSelection()` is called:

1. Updates the `selectedBlockIds` array
2. Updates the `selected` field on all affected blocks
3. Components render based on the `selected` field for performance

#### DragSlice

```typescript
// State
interface DragState {
  isActive: boolean
  sourceType: 'library' | 'canvas' | null
  draggedItem: any // The item being dragged (block template or existing block)
  position: {
    x: number
    y: number
  }
  offset: {
    x: number
    y: number
  }
}

// Actions
interface DragActions {
  setDragState: (state: Partial<DragState>) => void
  updateDragPosition: (x: number, y: number) => void
  clearDragState: () => void
}

// Combined type
type DragSlice = DragState & DragActions

// Helper selectors
const dragSelectors = {
  isDragging: (state: DragSlice) => state.isActive,
  getDraggedItem: (state: DragSlice) => state.draggedItem,
  getDragPosition: (state: DragSlice) => state.position,
  getDragOffset: (state: DragSlice) => state.offset,
  getDragSource: (state: DragSlice) => state.sourceType,
}
```

#### AppStore (Combined Store)

```typescript
interface AppState {
  initialized: boolean
}

interface AppActions {
  setInitialized: (initialized: boolean) => void
}

type AppStore = AppState & AppActions & DragSlice & BlocksSlice & UISlice
```

#### Selection Patterns

**Current Implementation (BlocksSlice):**

1. **Single Selection**
   - Click on block: Replace current selection with single block
   - Click on canvas: Clear all selection

**Future Multi-Selection Support:**
The current `selectBlock()` implementation supports only single selection. Multi-select patterns would require extending BlocksActions with:

- `toggleBlockSelection(blockId: string)` - Toggle individual block
- `selectRange(fromBlockId: string, toBlockId: string)` - Range selection
- `selectAll()` - Select all blocks
- `selectWithinBounds(bounds)` - Rectangle selection

#### UISlice

**Purpose:** Manages cross-component UI interactions and focus behavior to prevent user input conflicts and provide smooth UX transitions.

```typescript
// State
interface UIState {
  // No state properties currently - designed for actions only
  // Future: could store focus state, modal state, etc.
}

// Actions
interface UIActions {
  blurSearchInput: () => void // Triggers search input to lose focus
  registerSearchBlurCallback: (callback: () => void) => void // Registers blur handler
}

// Combined type
type UISlice = UIState & UIActions
```

#### UI Interaction Patterns

1. **Search Focus Management**

   - **Search Focus → Clear Selection**: When user focuses search input, canvas block selection is automatically cleared
   - **Block Selection → Blur Search**: When user selects a block, search input automatically loses focus
   - Prevents backspace conflicts between search editing and block deletion

2. **Callback Registration Pattern**

   - `registerSearchBlurCallback()` allows BlockLibrary to register a blur function
   - `blurSearchInput()` triggers the registered callback from Canvas component
   - Decouples components while enabling cross-component communication

3. **Safe Execution**
   - Uses optional chaining (`blurSearchInput?.()`) for test environment compatibility
   - No state dependencies - purely action-based interactions
