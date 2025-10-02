import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  parseTemplateDependencies,
  resolveAllDependencies,
  generateShadcnInstallCommands,
  generateShadcnblocksInstallCommands,
  generateKiboInstallCommands,
  generateReadmeWithDependencies,
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

      expect(result.shadcnComponents).toEqual(
        new Set(['button', 'card', 'badge'])
      )
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

    it('should extract shadcnblocks components from imports', () => {
      const source = `
        import { Logo, LogoImage, LogoText } from './logo'
        import { Button } from './ui/button'
        import { ArrowRight } from 'lucide-react'

        export function Component() {
          return <div></div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.shadcnblocksComponents).toEqual(new Set(['logo']))
      expect(result.shadcnComponents).toEqual(new Set(['button']))
      expect(result.lucideIcons).toEqual(new Set(['ArrowRight']))
    })

    it('should extract kibo-ui components from imports', () => {
      const source = `
        import type { BundledLanguage } from './ui/kibo-ui/code-block'
        import {
          CodeBlock,
          CodeBlockBody,
          CodeBlockContent
        } from './ui/kibo-ui/code-block'
        import { Button } from './ui/button'
        import { ArrowRight } from 'lucide-react'

        export function Component() {
          return <div></div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.kiboComponents).toEqual(new Set(['code-block']))
      expect(result.shadcnComponents).toEqual(new Set(['button']))
      expect(result.lucideIcons).toEqual(new Set(['ArrowRight']))
    })

    it('should extract kibo-ui components with absolute paths', () => {
      const source = `
        import { CodeBlock } from '@/components/ui/kibo-ui/code-block'
        import { DataTable } from '@/components/ui/kibo-ui/data-table'

        export function Component() {
          return <div></div>
        }
      `

      const result = parseTemplateDependencies(source)

      expect(result.kiboComponents).toEqual(new Set(['code-block', 'data-table']))
      expect(result.shadcnComponents.size).toBe(0)
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
      expect(result.shadcnblocksComponents.size).toBe(0)
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
      expect(result.shadcnblocksComponents.size).toBe(0)

      // Check npm dependencies
      expect(result.npmDependencies.dependencies.has('react')).toBe(true)
      expect(result.npmDependencies.dependencies.has('react-dom')).toBe(true)
      expect(result.npmDependencies.dependencies.has('lucide-react')).toBe(true)
      expect(result.npmDependencies.dependencies.has('clsx')).toBe(true)

      // Check dev dependencies
      expect(result.npmDependencies.devDependencies.has('typescript')).toBe(
        true
      )
      expect(result.npmDependencies.devDependencies.has('vite')).toBe(true)
      expect(result.npmDependencies.devDependencies.has('tailwindcss')).toBe(
        true
      )
      expect(
        result.npmDependencies.devDependencies.has('@tailwindcss/postcss')
      ).toBe(true)
      expect(result.npmDependencies.devDependencies.has('autoprefixer')).toBe(
        false
      )
    })

    it('should handle missing templates gracefully', () => {
      const mockGetTemplateSource = vi.mocked(templateSources.getTemplateSource)
      mockGetTemplateSource.mockReturnValue(null)

      const result = resolveAllDependencies(['unknown1', 'unknown2'])

      expect(result.shadcnComponents.size).toBe(0)
      expect(result.shadcnblocksComponents.size).toBe(0)
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

      const result = resolveAllDependencies([
        'template1',
        'template2',
        'template3',
      ])

      expect(result.shadcnComponents).toEqual(new Set(['button']))
      expect(result.shadcnblocksComponents.size).toBe(0)
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

      expect(result.npmDependencies.dependencies.has('lucide-react')).toBe(
        false
      )
    })

    it('should include Tailwind CSS v4 dependencies with correct versions', () => {
      const mockGetTemplateSource = vi.mocked(templateSources.getTemplateSource)

      mockGetTemplateSource.mockImplementation(() => {
        return `
          import { Button } from './ui/button'
          export function Component() {}
        `
      })

      const result = resolveAllDependencies(['template1'])

      // Check Tailwind v4 specific dependencies
      expect(result.npmDependencies.devDependencies.get('tailwindcss')).toBe(
        '^4.0.0'
      )
      expect(
        result.npmDependencies.devDependencies.get('@tailwindcss/postcss')
      ).toBe('^4.0.0')
      expect(result.npmDependencies.devDependencies.has('autoprefixer')).toBe(
        false
      )
      expect(result.npmDependencies.devDependencies.has('postcss')).toBe(true)
    })

    it('should resolve shadcnblocks dependencies', () => {
      const mockGetTemplateSource = vi.mocked(templateSources.getTemplateSource)

      mockGetTemplateSource.mockImplementation((id) => {
        if (id === 'footer2') {
          return `
            import { Logo, LogoImage, LogoText } from './logo'
            import { Button } from './ui/button'
            export function Footer2() {}
          `
        }
        return null
      })

      const result = resolveAllDependencies(['footer2'])

      expect(result.shadcnComponents).toEqual(new Set(['button']))
      expect(result.shadcnblocksComponents).toEqual(new Set(['logo']))
      expect(result.lucideIcons.size).toBe(0)
    })
  })

  describe('generateShadcnblocksInstallCommands', () => {
    it('should generate commands for multiple shadcnblocks components', () => {
      const components = new Set(['logo', 'button-group', 'navbar'])

      const commands = generateShadcnblocksInstallCommands(components)

      expect(commands).toContain(
        'npx shadcn@latest add https://shadcnblocks.com/r/button-group'
      )
      expect(commands).toContain(
        'npx shadcn@latest add https://shadcnblocks.com/r/logo'
      )
      expect(commands).toContain(
        'npx shadcn@latest add https://shadcnblocks.com/r/navbar'
      )
      expect(commands.length).toBe(3)
    })

    it('should return empty array for no components', () => {
      const components = new Set<string>()

      const commands = generateShadcnblocksInstallCommands(components)

      expect(commands).toEqual([])
    })

    it('should sort components alphabetically', () => {
      const components = new Set(['navbar', 'logo', 'button-group'])

      const commands = generateShadcnblocksInstallCommands(components)

      expect(commands[0]).toBe(
        'npx shadcn@latest add https://shadcnblocks.com/r/button-group'
      )
      expect(commands[1]).toBe(
        'npx shadcn@latest add https://shadcnblocks.com/r/logo'
      )
      expect(commands[2]).toBe(
        'npx shadcn@latest add https://shadcnblocks.com/r/navbar'
      )
    })
  })

  describe('generateKiboInstallCommands', () => {
    it('should generate commands for multiple kibo-ui components', () => {
      const components = new Set(['code-block', 'data-table', 'chart'])

      const commands = generateKiboInstallCommands(components)

      expect(commands).toContain('npx kibo-ui@latest add chart')
      expect(commands).toContain('npx kibo-ui@latest add code-block')
      expect(commands).toContain('npx kibo-ui@latest add data-table')
      expect(commands.length).toBe(3)
    })

    it('should return empty array for no components', () => {
      const components = new Set<string>()

      const commands = generateKiboInstallCommands(components)

      expect(commands).toEqual([])
    })

    it('should sort components alphabetically', () => {
      const components = new Set(['data-table', 'chart', 'code-block'])

      const commands = generateKiboInstallCommands(components)

      expect(commands[0]).toBe('npx kibo-ui@latest add chart')
      expect(commands[1]).toBe('npx kibo-ui@latest add code-block')
      expect(commands[2]).toBe('npx kibo-ui@latest add data-table')
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

      const readme = generateReadmeWithDependencies(
        components,
        new Set(),
        new Set(),
        'Test Project'
      )

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

    it('should generate README with both shadcn and shadcnblocks components', () => {
      const shadcnComponents = new Set(['button', 'card'])
      const shadcnblocksComponents = new Set(['logo', 'navbar'])

      const readme = generateReadmeWithDependencies(
        shadcnComponents,
        shadcnblocksComponents,
        new Set(),
        'Test Project'
      )

      expect(readme).toContain('# Test Project')
      expect(readme).toContain('npx shadcn@latest init -d')
      expect(readme).toContain('npx shadcn@latest add button')
      expect(readme).toContain('npx shadcn@latest add card')
      expect(readme).toContain(
        'npx shadcn@latest add https://shadcnblocks.com/r/logo'
      )
      expect(readme).toContain(
        'npx shadcn@latest add https://shadcnblocks.com/r/navbar'
      )
      expect(readme).toContain(
        'Additionally, install the required shadcnblocks components:'
      )
    })

    it('should generate README with kibo-ui components', () => {
      const shadcnComponents = new Set(['button'])
      const kiboComponents = new Set(['code-block', 'data-table'])

      const readme = generateReadmeWithDependencies(
        shadcnComponents,
        new Set(),
        kiboComponents,
        'Test Project'
      )

      expect(readme).toContain('# Test Project')
      expect(readme).toContain('npx kibo-ui@latest add code-block')
      expect(readme).toContain('npx kibo-ui@latest add data-table')
      expect(readme).toContain(
        'Additionally, install the required kibo-ui components:'
      )
    })

    it('should generate README with shadcn, shadcnblocks, and kibo-ui components', () => {
      const shadcnComponents = new Set(['button', 'card'])
      const shadcnblocksComponents = new Set(['logo'])
      const kiboComponents = new Set(['code-block'])

      const readme = generateReadmeWithDependencies(
        shadcnComponents,
        shadcnblocksComponents,
        kiboComponents,
        'Test Project'
      )

      expect(readme).toContain('npx shadcn@latest add button')
      expect(readme).toContain(
        'npx shadcn@latest add https://shadcnblocks.com/r/logo'
      )
      expect(readme).toContain('npx kibo-ui@latest add code-block')
      expect(readme).toContain('Additionally, install the required shadcnblocks')
      expect(readme).toContain('Additionally, install the required kibo-ui')
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
      expect(readme).toContain('Tailwind CSS v4')
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
