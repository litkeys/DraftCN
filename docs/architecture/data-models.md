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
- `selected: boolean` - Whether block is currently selected

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
  componentCode: string;
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
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    typeId,
    props,
    x: snapToGrid(position.x),
    y: snapToGrid(position.y),
    width: template.defaultWidth,
    height: template.defaultHeight,
    z: getNextZIndex(),
    selected: false
  };
}
```

#### 3. Adding New Templates - Step by Step

**Step 1: Create Your Component**
Create a new React component file in `src/templates/` folder:

```typescript
// src/templates/navbar/NavbarComponent.tsx
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
In `src/lib/blocks/registry.ts`, add your template:

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

### CanvasState

```typescript
interface CanvasState {
  blocks: Block[];
  width: number;
  height: number;
  gridSize: number;
  showGrid: boolean;
  isDragging: boolean;
  draggedItem?: {
    type: 'template' | 'block';
    typeId?: string;
    blockId?: string;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  };
}
```
