import { getTemplateSource } from '../blocks/template-sources'

export interface DependencyInfo {
  npmDependencies: {
    dependencies: Map<string, string>
    devDependencies: Map<string, string>
  }
  shadcnComponents: Set<string>
  shadcnblocksComponents: Set<string>
  lucideIcons: Set<string>
}

/**
 * Parse a template source to extract its dependencies
 */
export function parseTemplateDependencies(templateSource: string): {
  shadcnComponents: Set<string>
  lucideIcons: Set<string>
  shadcnblocksComponents: Set<string>
  otherImports: Set<string>
} {
  const shadcnComponents = new Set<string>()
  const lucideIcons = new Set<string>()
  const shadcnblocksComponents = new Set<string>()
  const otherImports = new Set<string>()

  // Match import statements
  const importRegex =
    /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g
  let match

  while ((match = importRegex.exec(templateSource)) !== null) {
    const importPath = match[1]

    // Check for shadcn/ui components
    if (
      importPath.startsWith('./ui/') ||
      importPath.startsWith('@/components/ui/')
    ) {
      // Extract component name from path
      const componentMatch = importPath.match(/ui\/([^/]+)$/)
      if (componentMatch) {
        shadcnComponents.add(componentMatch[1])
      }
    }
    // Check for shadcnblocks components
    else if (
      importPath.startsWith('./') ||
      importPath.startsWith('@/components/shadcnblocks/')
    ) {
      // Extract component name from path (logo -> logo, shadcnblocks/logo -> logo)
      const componentMatch = importPath.match(/(?:shadcnblocks\/)?([^/]+)$/)
      if (componentMatch && componentMatch[1] !== 'utils') {
        // Exclude utils and only include actual components
        shadcnblocksComponents.add(componentMatch[1])
      }
    }
    // Check for lucide-react icons
    else if (importPath === 'lucide-react') {
      // Extract icon names from the import statement
      const fullImport = match[0]
      const iconMatch = fullImport.match(/\{([^}]+)\}/)
      if (iconMatch) {
        const icons = iconMatch[1].split(',').map((icon) => icon.trim())
        icons.forEach((icon) => {
          // Remove 'as' aliases if present
          const cleanIcon = icon.split(' as ')[0].trim()
          if (cleanIcon) {
            lucideIcons.add(cleanIcon)
          }
        })
      }
    }
    // Track other imports (excluding React and relative paths)
    else if (!importPath.startsWith('.') && !importPath.startsWith('react')) {
      otherImports.add(importPath)
    }
  }

  return { shadcnComponents, lucideIcons, shadcnblocksComponents, otherImports }
}

/**
 * Resolve all dependencies from a set of template typeIds
 */
export function resolveAllDependencies(templateIds: string[]): DependencyInfo {
  const allShadcnComponents = new Set<string>()
  const allShadcnblocksComponents = new Set<string>()
  const allLucideIcons = new Set<string>()
  const allOtherImports = new Set<string>()

  // Parse each template
  for (const templateId of templateIds) {
    const source = getTemplateSource(templateId)
    if (source) {
      const {
        shadcnComponents,
        shadcnblocksComponents,
        lucideIcons,
        otherImports,
      } = parseTemplateDependencies(source)

      shadcnComponents.forEach((component) =>
        allShadcnComponents.add(component)
      )
      shadcnblocksComponents.forEach((component) =>
        allShadcnblocksComponents.add(component)
      )
      lucideIcons.forEach((icon) => allLucideIcons.add(icon))
      otherImports.forEach((imp) => allOtherImports.add(imp))
    }
  }

  // Build npm dependencies
  const dependencies = new Map<string, string>()
  const devDependencies = new Map<string, string>()

  // Core React dependencies
  dependencies.set('react', '^18.0.0')
  dependencies.set('react-dom', '^18.0.0')

  // Add lucide-react if any icons are used
  if (allLucideIcons.size > 0) {
    dependencies.set('lucide-react', 'latest')
  }

  // Add utility libraries commonly used by shadcn
  dependencies.set('clsx', '^2.0.0')
  dependencies.set('tailwind-merge', '^2.0.0')
  dependencies.set('class-variance-authority', '^0.7.0')

  // Development dependencies
  devDependencies.set('@types/react', '^18.0.0')
  devDependencies.set('@types/react-dom', '^18.0.0')
  devDependencies.set('@vitejs/plugin-react', '^4.0.0')
  devDependencies.set('@tailwindcss/postcss', '^4.0.0')
  devDependencies.set('postcss', '^8.0.0')
  devDependencies.set('tailwindcss', '^4.0.0')
  devDependencies.set('typescript', '^5.0.0')
  devDependencies.set('vite', '^5.0.0')

  return {
    npmDependencies: {
      dependencies,
      devDependencies,
    },
    shadcnComponents: allShadcnComponents,
    shadcnblocksComponents: allShadcnblocksComponents,
    lucideIcons: allLucideIcons,
  }
}

/**
 * Generate shadcn installation commands for README
 */
export function generateShadcnInstallCommands(
  components: Set<string>
): string[] {
  if (components.size === 0) return []

  const commands: string[] = []

  // Always need to init shadcn first
  commands.push('npx shadcn@latest init -d')

  // Add command for each component
  const sortedComponents = Array.from(components).sort()
  for (const component of sortedComponents) {
    commands.push(`npx shadcn@latest add ${component}`)
  }

  return commands
}

/**
 * Generate shadcnblocks installation commands for README
 */
export function generateShadcnblocksInstallCommands(
  components: Set<string>
): string[] {
  if (components.size === 0) return []

  const commands: string[] = []

  // Add command for each shadcnblocks component
  const sortedComponents = Array.from(components).sort()
  for (const component of sortedComponents) {
    commands.push(
      `npx shadcn@latest add https://shadcnblocks.com/r/${component}`
    )
  }

  return commands
}

/**
 * Generate a comprehensive README with installation instructions
 */
export function generateReadmeWithDependencies(
  shadcnComponents: Set<string>,
  shadcnblocksComponents: Set<string> = new Set(),
  projectName: string = 'DraftCN React Export'
): string {
  const shadcnCommands = generateShadcnInstallCommands(shadcnComponents)
  const shadcnblocksCommands = generateShadcnblocksInstallCommands(
    shadcnblocksComponents
  )

  let readme = `# ${projectName}

This project was exported from DraftCN, a visual page builder for React.

## Setup Instructions

Follow these steps to get your project running:

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Initialize and Install shadcn/ui Components

This project uses shadcn/ui components. You need to initialize shadcn and install the required components:

\`\`\`bash
# Initialize shadcn/ui (press Enter to accept defaults)
${shadcnCommands[0] || 'npx shadcn@latest init -d'}
\`\`\`
`

  if (shadcnCommands.length > 1) {
    readme += `
After initialization completes, install the required components:

\`\`\`bash
${shadcnCommands.slice(1).join('\n')}
\`\`\`
`
  }

  if (shadcnblocksCommands.length > 0) {
    readme += `
Additionally, install the required shadcnblocks components:

\`\`\`bash
${shadcnblocksCommands.join('\n')}
\`\`\`
`
  }

  readme += `
### 3. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Your application will be available at http://localhost:5173

## Project Structure

\`\`\`
src/
├── components/       # Your exported components
├── App.tsx          # Main application with layout
├── index.tsx        # React entry point
└── globals.css      # Global styles and theming
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Utility-first CSS with CSS-first configuration
- **shadcn/ui** - Component library

## Customization

### Modifying Components

All components are in \`src/components/\`. They are fully customizable React components.

### Adjusting Layout

The layout is preserved from your DraftCN design using absolute positioning. To make it responsive:
1. Update positioning in \`src/App.tsx\`
2. Add media queries or use Tailwind's responsive utilities

### Styling

- Global styles are in \`src/globals.css\`
- Components use Tailwind CSS classes
- Theme variables are CSS custom properties

## Next Steps

1. **Make it Responsive**: Add breakpoints and responsive behavior
2. **Add Interactivity**: Wire up buttons, forms, and navigation
3. **Connect Backend**: Add API calls and data fetching
4. **Deploy**: Use Vercel, Netlify, or any static hosting service

## Support

For issues or questions about DraftCN, visit: https://github.com/your-repo/draftcn

---

Generated with DraftCN • ${new Date().toLocaleDateString()}
`

  return readme
}
