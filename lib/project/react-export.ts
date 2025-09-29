import JSZip from 'jszip'
import { Block } from '@/types/block'
import { getTemplateSource } from '@/lib/blocks/template-sources'
import { globalsCssSource } from './globals.css.source'
import {
  packageJsonTemplate,
  viteConfigTemplate,
  tsConfigTemplate,
  postcssConfigTemplate,
  eslintConfigTemplate,
  indexHtmlTemplate,
  indexTsxTemplate,
  gitignoreTemplate,
} from './static-sources'
import {
  resolveAllDependencies,
  generateReadmeWithDependencies,
} from './dependency-resolver'

export interface ReactProjectFile {
  path: string
  content: string
}

export interface TemplateInfo {
  typeId: string
  componentName: string
  source: string
}

export interface DependencyInfo {
  dependencies: Set<string>
  devDependencies: Set<string>
}

/**
 * Extract unique templates from blocks
 */
export function extractUniqueTemplates(blocks: Block[]): Set<string> {
  const uniqueTemplates = new Set<string>()

  for (const block of blocks) {
    uniqueTemplates.add(block.typeId)
  }

  return uniqueTemplates
}

/**
 * Convert typeId to component name (e.g., "hero1" -> "Hero1")
 */
export function typeIdToComponentName(typeId: string): string {
  return typeId.charAt(0).toUpperCase() + typeId.slice(1)
}

/**
 * Generate a component file from template source
 */
export function generateComponentFile(typeId: string): ReactProjectFile | null {
  const source = getTemplateSource(typeId)

  if (!source) {
    console.warn(`No source found for template: ${typeId}`)
    return null
  }

  const componentName = typeIdToComponentName(typeId)
  const componentPath = `src/components/${componentName}.tsx`

  return {
    path: componentPath,
    content: source,
  }
}

/**
 * Resolve dependencies from template imports (deprecated - use resolveAllDependencies)
 */
export function resolveDependencies(blocks: Block[]): DependencyInfo {
  // This function is maintained for backward compatibility
  // but now delegates to the new dependency resolver
  const uniqueTemplates = extractUniqueTemplates(blocks)
  const resolvedDeps = resolveAllDependencies(Array.from(uniqueTemplates))

  return {
    dependencies: new Set(resolvedDeps.npmDependencies.dependencies.keys()),
    devDependencies: new Set(
      resolvedDeps.npmDependencies.devDependencies.keys()
    ),
  }
}

/**
 * Generate the main App.tsx component
 */
export function generateAppComponent(blocks: Block[]): string {
  const uniqueTemplates = extractUniqueTemplates(blocks)

  // Generate imports
  const imports: string[] = []
  for (const typeId of uniqueTemplates) {
    const componentName = typeIdToComponentName(typeId)
    imports.push(
      `import { ${componentName} } from './components/${componentName}'`
    )
  }

  // Generate block rendering
  const blockComponents: string[] = []
  for (const block of blocks) {
    const componentName = typeIdToComponentName(block.typeId)
    const props = block.props ? JSON.stringify(block.props) : '{}'

    blockComponents.push(`
      <div
        key="${block.id}"
        style={{
          position: 'absolute',
          top: ${block.y},
          left: 0,
          right: 0,
          zIndex: ${block.z || 0}
        }}
      >
        <${componentName} {...${props}} />
      </div>`)
  }

  return `${imports.join('\n')}

function App() {
  return (
    <div className="relative min-h-screen">
      ${blockComponents.join('\n      ')}
    </div>
  )
}

export default App`
}

/**
 * Generate shadcn/ui component files
 */
export function generateShadcnComponents(): ReactProjectFile[] {
  const shadcnComponents: ReactProjectFile[] = []

  // Button component
  shadcnComponents.push({
    path: 'src/components/ui/button.tsx',
    content: `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,
  })

  // Badge component
  shadcnComponents.push({
    path: 'src/components/ui/badge.tsx',
    content: `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }`,
  })

  // Card component
  shadcnComponents.push({
    path: 'src/components/ui/card.tsx',
    content: `import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`,
  })

  // Input component (used by some templates)
  shadcnComponents.push({
    path: 'src/components/ui/input.tsx',
    content: `import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }`,
  })

  return shadcnComponents
}

/**
 * Generate utility files
 */
export function generateUtilityFiles(): ReactProjectFile[] {
  return [
    {
      path: 'src/lib/utils.ts',
      content: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
    },
  ]
}

/**
 * Generate all project files
 */
export function generateProjectFiles(blocks: Block[]): ReactProjectFile[] {
  const files: ReactProjectFile[] = []

  // Generate component files from templates
  const uniqueTemplates = extractUniqueTemplates(blocks)
  for (const typeId of uniqueTemplates) {
    const componentFile = generateComponentFile(typeId)
    if (componentFile) {
      files.push(componentFile)
    }
  }

  // Resolve dependencies from templates
  const { npmDependencies, shadcnComponents, shadcnblocksComponents } =
    resolveAllDependencies(Array.from(uniqueTemplates))

  // Generate shadcn/ui components (no longer include these - user will install via CLI)
  // files.push(...generateShadcnComponents())

  // Generate utility files
  files.push(...generateUtilityFiles())

  // Generate App.tsx
  files.push({
    path: 'src/App.tsx',
    content: generateAppComponent(blocks),
  })

  // Generate index.tsx
  files.push({
    path: 'src/index.tsx',
    content: indexTsxTemplate,
  })

  // Generate globals.css
  files.push({
    path: 'src/globals.css',
    content: globalsCssSource,
  })

  // Generate package.json with resolved dependencies
  const packageJson = {
    ...packageJsonTemplate,
    dependencies: Object.fromEntries(npmDependencies.dependencies),
    devDependencies: Object.fromEntries(npmDependencies.devDependencies),
  }

  files.push({
    path: 'package.json',
    content: JSON.stringify(packageJson, null, 2),
  })

  files.push({
    path: 'vite.config.ts',
    content: viteConfigTemplate,
  })

  files.push({
    path: 'tsconfig.json',
    content: JSON.stringify(tsConfigTemplate, null, 2),
  })

  files.push({
    path: 'postcss.config.js',
    content: postcssConfigTemplate,
  })

  files.push({
    path: '.eslintrc.json',
    content: JSON.stringify(eslintConfigTemplate, null, 2),
  })

  files.push({
    path: 'index.html',
    content: indexHtmlTemplate,
  })

  // Generate README with shadcn installation commands
  files.push({
    path: 'README.md',
    content: generateReadmeWithDependencies(
      shadcnComponents,
      shadcnblocksComponents,
      'DraftCN React Export'
    ),
  })

  files.push({
    path: '.gitignore',
    content: gitignoreTemplate,
  })

  return files
}

/**
 * Generate React project and return as ZIP blob
 */
export async function generateReactProject(blocks: Block[]): Promise<Blob> {
  const zip = new JSZip()
  const files = generateProjectFiles(blocks)

  // Add all files to ZIP
  for (const file of files) {
    zip.file(file.path, file.content)
  }

  // Generate ZIP blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  })

  return blob
}

/**
 * Download React project as ZIP file
 */
export function downloadReactProject(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Generate export filename with timestamp
 */
export function generateReactExportFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `draftcn-react-export-${year}-${month}-${day}-${hours}${minutes}${seconds}.zip`
}
