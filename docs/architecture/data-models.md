# Data Models

## Block

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

### TypeScript Interface
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

### Relationships
- References a BlockTemplate via typeId
- Props must conform to template's interface structure
- Z-index determines visual stacking when blocks overlap

## BlockTemplate

**Purpose:** Defines reusable block blueprints with their dependencies, default props, and rendering code.

**Key Attributes:**
- `typeId: string` - Unique template identifier (e.g., "hero-1")
- `name: string` - Display name for the template
- `category: string` - Template category for grouping
- `thumbnail: string` - Base64 or URL for preview image
- `dependencies: string[]` - Required npm packages/imports extracted from imports
- `defaultProps: any` - Example content for initial rendering
- `componentCode: string` - Complete React component code (TSX as string)
- `defaultWidth: number` - Initial width in pixels
- `defaultHeight: number` - Initial height in pixels
- `minimumWidth: number` - Minimum allowed width for resizing
- `minimumHeight: number` - Minimum allowed height for resizing

### TypeScript Interface
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

### Relationships
- Templates are instantiated to create Block instances
- Global CSS file assumed to contain all required styles
- Dependencies list extracted from import statements

## BlockRegistry

**Purpose:** Manages the collection of available block templates and provides template processing utilities.

### TypeScript Interface
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

## TemplateProcessor

**Purpose:** Handles the conversion of source code files (like hero1.tsx) into BlockTemplate instances.

### TypeScript Interface
```typescript
interface TemplateProcessor {
  // Extract dependencies from import statements
  extractDependencies(code: string): string[];
  
  // Extract default props from component definition
  extractDefaultProps(code: string): any;
  
  // Get the complete component code
  extractComponentCode(code: string): string;
  
  // Complete processing pipeline
  processSourceFile(
    sourceCode: string,
    thumbnail: string,
    metadata: {
      typeId: string;
      name: string;
      category: string;
      defaultWidth: number;
      defaultHeight: number;
      minimumWidth: number;
      minimumHeight: number;
    }
  ): BlockTemplate;
}
```

## Methods for Block Template Development

### 1. Template Registration from Source File
```typescript
async function registerBlockTemplateFromSource(
  sourceCode: string,
  thumbnailPath: string,
  metadata: {
    typeId: string;
    name: string;
    category: string;
    defaultWidth: number;
    defaultHeight: number;
    minimumWidth: number;
    minimumHeight: number;
  }
): Promise<BlockTemplate> {
  // 1. Process source code to extract template data
  const template = templateProcessor.processSourceFile(
    sourceCode,
    thumbnailPath,
    metadata
  );
  
  // 2. Register in BlockRegistry
  blockRegistry.registerTemplate(template);
  
  return template;
}
```

### 2. Block Instance Creation
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

### 3. Expected Template Source Structure
Based on hero1.tsx, templates should follow this structure:

```typescript
// 1. Import statements (dependencies extracted from here)
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 2. Props interface (structure parsed but types simplified to 'any')
interface Hero1Props {
  badge?: string;
  heading: string;
  description: string;
  // ... other props
}

// 3. Component with default props (defaultProps extracted from here)
const Hero1 = ({
  badge = "✨ Your Website Builder",
  heading = "Blocks Built With Shadcn & Tailwind",
  // ... default values
}: Hero1Props) => {
  // Component JSX
};

// 4. Export (component name extracted)
export { Hero1 };
```

## CanvasState

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
