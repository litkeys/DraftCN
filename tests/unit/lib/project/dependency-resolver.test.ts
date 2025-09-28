import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  parseTemplateDependencies,
  resolveAllDependencies,
  generateShadcnInstallCommands,
  generateReadmeWithDependencies
} from '@/lib/project/dependency-resolver'
import * as templateSources from '@/lib/blocks/template-sources'

// Mock the template sources module
vi.mock('@/lib/blocks/template-sources')

describe('dependency-resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseTemplateDependencies', () => {
    it('should extract shadcn/ui components from imports', () => {
      const source = `
        import { Button } from './ui/button'
        import { Card, CardContent } from './ui/card'
        import { Badge } from '@/components/ui/badge'

        export function Component() {
          return <div></div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.shadcnComponents).toEqual(new Set(['button', 'card', 'badge']))
      expect(result.lucideIcons.size).toBe(0)
    })

    it('should extract lucide-react icons from imports', () => {
      const source = `
        import { ChevronRight, Menu, X as CloseIcon } from 'lucide-react'
        import { Button } from './ui/button'

        export function Component() {
          return <div></div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.lucideIcons).toEqual(new Set(['ChevronRight', 'Menu', 'X']))
      expect(result.shadcnComponents).toEqual(new Set(['button']))
    })

    it('should handle mixed imports', () => {
      const source = `
        import React from 'react'
        import { Button } from './ui/button'
        import { Input } from '@/components/ui/input'
        import { ArrowRight, Check } from 'lucide-react'
        import { cn } from '@/lib/utils'
        import Link from 'next/link'

        export function Component() {
          return <div></div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.shadcnComponents).toEqual(new Set(['button', 'input']))
      expect(result.lucideIcons).toEqual(new Set(['ArrowRight', 'Check']))
      expect(result.otherImports).toContain('next/link')
    })

    it('should handle templates with no dependencies', () => {
      const source = `
        import React from 'react'

        export function Component() {
          return <div>Simple component</div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.shadcnComponents.size).toBe(0)
      expect(result.lucideIcons.size).toBe(0)
    })

    it('should handle various import formats', () => {
      const source = `
        import * as Icons from 'lucide-react'
        import Button from './ui/button'
        import {
          Card,
          CardHeader,
          CardContent
        } from './ui/card'

        export function Component() {
          return <div></div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.shadcnComponents).toContain('card')
      expect(result.shadcnComponents).toContain('button')
    })
  })

  describe('resolveAllDependencies', () => {
    it('should resolve dependencies from multiple templates', () => {
      const mockGetTemplateSource = vi.mocked(templateSources.getTemplateSource)

      mockGetTemplateSource.mockImplementation((id) => {
        if (id === 'hero1') {
          return `
            import { Button } from './ui/button'
            import { ArrowRight } from 'lucide-react'
            export function Hero1() {}
          `
        }
        if (id === 'navbar1') {
          return `
            import { Badge } from './ui/badge'
            import { Menu } from 'lucide-react'
            export function Navbar1() {}
          `
        }
        return null
      })

      const result = resolveAllDependencies(['hero1', 'navbar1'])

      expect(result.shadcnComponents).toEqual(new Set(['button', 'badge']))
      expect(result.lucideIcons).toEqual(new Set(['ArrowRight', 'Menu']))

      // Check npm dependencies
      expect(result.npmDependencies.dependencies.has('react')).toBe(true)
      expect(result.npmDependencies.dependencies.has('react-dom')).toBe(true)
      expect(result.npmDependencies.dependencies.has('lucide-react')).toBe(true)
      expect(result.npmDependencies.dependencies.has('clsx')).toBe(true)

      // Check dev dependencies
      expect(result.npmDependencies.devDependencies.has('typescript')).toBe(true)
      expect(result.npmDependencies.devDependencies.has('vite')).toBe(true)
      expect(result.npmDependencies.devDependencies.has('tailwindcss')).toBe(true)
    })

    it('should handle missing templates gracefully', () => {
      const mockGetTemplateSource = vi.mocked(templateSources.getTemplateSource)
      mockGetTemplateSource.mockReturnValue(null)

      const result = resolveAllDependencies(['unknown1', 'unknown2'])

      expect(result.shadcnComponents.size).toBe(0)
      expect(result.lucideIcons.size).toBe(0)

      // Core dependencies should still be included
      expect(result.npmDependencies.dependencies.has('react')).toBe(true)
    })

    it('should deduplicate dependencies across templates', () => {
      const mockGetTemplateSource = vi.mocked(templateSources.getTemplateSource)

      mockGetTemplateSource.mockImplementation(() => {
        return `
          import { Button } from './ui/button'
          import { Button as Btn } from './ui/button'
          import { ArrowRight } from 'lucide-react'
          export function Component() {}
        `
      })

      const result = resolveAllDependencies(['template1', 'template2', 'template3'])

      expect(result.shadcnComponents).toEqual(new Set(['button']))
      expect(result.lucideIcons).toEqual(new Set(['ArrowRight']))
    })

    it('should not add lucide-react if no icons are used', () => {
      const mockGetTemplateSource = vi.mocked(templateSources.getTemplateSource)

      mockGetTemplateSource.mockImplementation(() => {
        return `
          import { Button } from './ui/button'
          export function Component() {}
        `
      })

      const result = resolveAllDependencies(['template1'])

      expect(result.npmDependencies.dependencies.has('lucide-react')).toBe(false)
    })
  })

  describe('generateShadcnInstallCommands', () => {
    it('should generate commands for multiple components', () => {
      const components = new Set(['button', 'card', 'badge', 'input'])

      const commands = generateShadcnInstallCommands(components)

      expect(commands).toContain('npx shadcn@latest init -d')
      expect(commands).toContain('npx shadcn@latest add badge')
      expect(commands).toContain('npx shadcn@latest add button')
      expect(commands).toContain('npx shadcn@latest add card')
      expect(commands).toContain('npx shadcn@latest add input')
      expect(commands.length).toBe(5) // init + 4 components
    })

    it('should return empty array for no components', () => {
      const components = new Set<string>()

      const commands = generateShadcnInstallCommands(components)

      expect(commands).toEqual([])
    })

    it('should sort components alphabetically', () => {
      const components = new Set(['dialog', 'button', 'alert'])

      const commands = generateShadcnInstallCommands(components)

      // After init, components should be in alphabetical order
      expect(commands[1]).toBe('npx shadcn@latest add alert')
      expect(commands[2]).toBe('npx shadcn@latest add button')
      expect(commands[3]).toBe('npx shadcn@latest add dialog')
    })
  })

  describe('generateReadmeWithDependencies', () => {
    it('should generate README with shadcn components', () => {
      const components = new Set(['button', 'card'])

      const readme = generateReadmeWithDependencies(components, 'Test Project')

      expect(readme).toContain('# Test Project')
      expect(readme).toContain('npx shadcn@latest init -d')
      expect(readme).toContain('npx shadcn@latest add button')
      expect(readme).toContain('npx shadcn@latest add card')
      expect(readme).toContain('npm install')
      expect(readme).toContain('npm run dev')
    })

    it('should generate README without shadcn commands when no components', () => {
      const components = new Set<string>()

      const readme = generateReadmeWithDependencies(components)

      expect(readme).toContain('# DraftCN React Export')
      expect(readme).toContain('npm install')
      expect(readme).toContain('npx shadcn@latest init -d')
      expect(readme).not.toContain('npx shadcn@latest add')
    })

    it('should include project structure and technologies', () => {
      const components = new Set(['button'])

      const readme = generateReadmeWithDependencies(components)

      expect(readme).toContain('## Project Structure')
      expect(readme).toContain('src/')
      expect(readme).toContain('components/')
      expect(readme).toContain('App.tsx')
      expect(readme).toContain('## Technologies')
      expect(readme).toContain('React 18')
      expect(readme).toContain('TypeScript')
      expect(readme).toContain('Vite')
      expect(readme).toContain('Tailwind CSS')
    })

    it('should include customization and next steps sections', () => {
      const components = new Set<string>()

      const readme = generateReadmeWithDependencies(components)

      expect(readme).toContain('## Customization')
      expect(readme).toContain('### Modifying Components')
      expect(readme).toContain('### Adjusting Layout')
      expect(readme).toContain('### Styling')
      expect(readme).toContain('## Next Steps')
      expect(readme).toContain('Make it Responsive')
      expect(readme).toContain('Add Interactivity')
    })

    it('should include current date', () => {
      const components = new Set<string>()

      const readme = generateReadmeWithDependencies(components)
      const currentDate = new Date().toLocaleDateString()

      expect(readme).toContain(currentDate)
    })

    it('should format commands properly in code blocks', () => {
      const components = new Set(['button', 'card'])

      const readme = generateReadmeWithDependencies(components)

      // Check for proper markdown code block formatting
      expect(readme).toMatch(/```bash\s*\n.*npm install/s)
      expect(readme).toMatch(/```bash\s*\n.*npx shadcn@latest init/s)
      expect(readme).toMatch(/```bash\s*\n.*npx shadcn@latest add button/s)
    })
  })
})