# Adding Block Templates to DraftCN

This guide explains how to add new block templates to the DraftCN visual builder. The system uses a manual registration approach where developers explicitly define and register each template.

## Overview

Block templates in DraftCN consist of:

1. A React component that renders the block
2. Metadata describing the template (name, category, dimensions)
3. Default props for initial rendering
4. A thumbnail image for the library preview

## Step-by-Step Guide

### Step 1: Create Your Component

Create a new React component file in the `templates/` directory:

```typescript
// templates/CTAComponent.tsx
import { Button } from '@/components/ui/button'

interface CTAProps {
  heading: string
  description: string
  primaryButtonText: string
  secondaryButtonText?: string
  backgroundColor?: string
}

export const CTAComponent = ({
  heading,
  description,
  primaryButtonText,
  secondaryButtonText,
  backgroundColor = '#f3f4f6',
}: CTAProps) => {
  return (
    <div className="cta-section" style={{ backgroundColor }}>
      <div className="cta-content">
        <h2 className="cta-heading">{heading}</h2>
        <p className="cta-description">{description}</p>
        <div className="cta-buttons">
          <Button variant="default">{primaryButtonText}</Button>
          {secondaryButtonText && (
            <Button variant="outline">{secondaryButtonText}</Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Create a Thumbnail

Create a preview image for your template:

- Size: 300x200px recommended
- Format: PNG or JPG
- Location: `public/thumbnails/[template-name].png`

Example: `public/thumbnails/cta-1.png`

### Step 3: Register the Template

Open `lib/blocks/registry.ts` and add your template registration:

```typescript
// lib/blocks/registry.ts
import { CTAComponent } from '@/templates/CTAComponent'

// Create the template definition
const ctaTemplate: BlockTemplate = {
  // Unique identifier for this template
  typeId: 'cta-1',

  // Display name shown in the library
  name: 'Call to Action',

  // Category for organization
  category: 'Marketing',

  // Path to thumbnail image
  thumbnail: '/thumbnails/cta-1.png',

  // List any special dependencies (shadcn components are already available)
  dependencies: ['@/components/ui/button'],

  // Default content when block is first added
  defaultProps: {
    heading: 'Ready to Get Started?',
    description:
      'Join thousands of users building amazing websites with DraftCN.',
    primaryButtonText: 'Start Free Trial',
    secondaryButtonText: 'Learn More',
    backgroundColor: '#f3f4f6',
  },

  // Reference to the React component
  component: CTAComponent,

  // Initial dimensions (in pixels)
  defaultWidth: 1200,
  defaultHeight: 300,

  // Minimum dimensions for resizing (future feature)
  minimumWidth: 600,
  minimumHeight: 200,
}

// Register the template
blockRegistry.registerTemplate(ctaTemplate)
```

### Step 4: Add Template Source for Export

To enable your template to be exported as part of a React project, create a source file with pre-processed imports:

1. Create a new file in `lib/blocks/template-sources/[template-name].source.ts`:

```typescript
// lib/blocks/template-sources/cta-1.source.ts
export const cta1Source = `import { Button } from './ui/button'

interface CTAProps {
  heading: string
  description: string
  primaryButtonText: string
  secondaryButtonText?: string
  backgroundColor?: string
}

export const CTAComponent = ({
  heading,
  description,
  primaryButtonText,
  secondaryButtonText,
  backgroundColor = '#f3f4f6',
}: CTAProps) => {
  return (
    <div className="cta-section" style={{ backgroundColor }}>
      <div className="cta-content">
        <h2 className="cta-heading">{heading}</h2>
        <p className="cta-description">{description}</p>
        <div className="cta-buttons">
          <Button variant="default">{primaryButtonText}</Button>
          {secondaryButtonText && (
            <Button variant="outline">{secondaryButtonText}</Button>
          )}
        </div>
      </div>
    </div>
  )
}

export { CTAComponent }`
```

**Important Notes:**

- Convert all imports from `@/components/ui/*` to `./ui/*`
- Convert all imports from `@/components/shadcnblocks/*` to `./*`
- Convert all imports from `@/components/ui/kibo-ui/*` to `./ui/kibo-ui/*`
- The source should be a complete, standalone TypeScript component
- Store as a template string with backticks

1. Update `lib/blocks/template-sources.ts` to include your new template:

```typescript
// lib/blocks/template-sources.ts
import { cta1Source } from './template-sources/cta-1.source'

// Add to the templateSources mapping
export const templateSources: TemplateSourceMap = {
  // ... existing templates
  'cta-1': cta1Source,
}
```

This ensures your template can be exported when users generate a React project from their designs.

### Step 5: Add Styles (Optional)

If your component needs custom styles, add them to `app/globals.css`:

```css
/* app/globals.css */
.cta-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-heading {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #111827;
}

.cta-description {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
```

### Step 6: Test Your Template

1. Start the development server: `npm run dev`
2. Open the builder in your browser
3. Look for your template in the sidebar under its category
4. Drag it onto the canvas to test
5. Verify the default props render correctly
6. Test selection and repositioning

## Template Structure Reference

### BlockTemplate Interface

```typescript
interface BlockTemplate {
  typeId: string // Unique identifier
  name: string // Display name
  category: string // Category for grouping
  thumbnail: string // Path to preview image
  dependencies: string[] // Required imports
  defaultProps: any // Initial props
  component: React.ComponentType<any> // React component
  defaultWidth: number // Initial width in pixels
  defaultHeight: number // Initial height in pixels
  minimumWidth: number // Minimum width (for resizing)
  minimumHeight: number // Minimum height (for resizing)
}
```

## Best Practices

### Component Design

- Keep components self-contained and reusable
- Use props for all customizable content
- Avoid hardcoded values - use defaultProps instead
- Ensure components work at different sizes
- Use semantic HTML for accessibility

### Props Interface

- Define clear, descriptive prop names
- Provide sensible defaults for optional props
- Use TypeScript interfaces for type safety
- Consider future customization needs

### Styling

- Use className for styling hooks
- Leverage global CSS for consistency
- Avoid inline styles except for dynamic values
- Ensure responsive design principles
- Test at minimum and default dimensions

### Categories

Common categories include:

- **Heroes** - Hero sections and banners
- **Navigation** - Headers, navbars, menus
- **Content** - Text sections, articles
- **Features** - Feature lists and grids
- **Marketing** - CTAs, testimonials
- **Forms** - Contact forms, newsletters
- **Footers** - Footer sections
- **Media** - Image galleries, videos

### Naming Conventions

- **typeId**: Use lowercase with hyphens and numbers (e.g., `hero-1`, `navbar-2`)
- **Component files**: Use PascalCase (e.g., `HeroComponent.tsx`)
- **Thumbnail files**: Match the typeId (e.g., `hero-1.png`)
- **CSS classes**: Use kebab-case (e.g., `hero-section`)

## Common Patterns

### Using shadcn/ui Components

```typescript
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// These are already installed and available
```

### Conditional Rendering

```typescript
const MyComponent = ({ showFeature, featureText }: Props) => {
  return (
    <div>{showFeature && <div className="feature">{featureText}</div>}</div>
  )
}
```

### List Rendering

```typescript
interface ItemProps {
  items: Array<{ id: string; text: string }>
}

const ListComponent = ({ items }: ItemProps) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  )
}
```

## Troubleshooting

### Template Not Appearing

- Verify the template is registered in `registry.ts`
- Check that the component is properly imported
- Ensure the thumbnail path is correct
- Look for console errors

### Rendering Issues

- Verify all required props have defaults
- Check for missing CSS styles
- Ensure component returns valid JSX
- Test with different prop values

### Style Problems

- Check if styles are added to `globals.css`
- Verify className matches CSS selectors
- Look for conflicting styles
- Test responsive behavior

## Future Enhancements

The current manual registration system will be enhanced in future versions with:

- Dynamic prop editing in the builder
- Visual template editor
- Template versioning
- Custom template libraries
- Import/export functionality

For now, focus on creating high-quality, reusable templates that demonstrate your design system and can be easily customized through props.
