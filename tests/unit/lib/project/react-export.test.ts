import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  extractUniqueTemplates,
  typeIdToComponentName,
  generateComponentFile,
  resolveDependencies,
  generateAppComponent,
  generateShadcnComponents,
  generateUtilityFiles,
  generateProjectFiles,
  generateReactProject,
  downloadReactProject,
  generateReactExportFilename,
} from '@/lib/project/react-export'
import { Block } from '@/types/block'
import * as templateSources from '@/lib/blocks/template-sources'

// Mock dependencies
vi.mock('@/lib/blocks/template-sources', () => ({
  getTemplateSource: vi.fn(),
}))
vi.mock('@/lib/project/globals.css.source', () => ({
  globalsCssSource: '/* mocked globals.css */',
}))
vi.mock('@/lib/project/static-sources', () => ({
  packageJsonTemplate: { name: 'test-project', version: '1.0.0' },
  viteConfigTemplate: '// mocked vite config',
  tsConfigTemplate: { compilerOptions: {} },
  tailwindConfigTemplate: '// mocked tailwind config',
  postcssConfigTemplate: '// mocked postcss config',
  eslintConfigTemplate: { rules: {} },
  indexHtmlTemplate: '<!DOCTYPE html>',
  indexTsxTemplate: 'import React from "react"',
  readmeTemplate: '# Test README',
  gitignoreTemplate: 'node_modules',
}))
vi.mock('jszip')

describe('React Export Utilities', () => {
  const mockBlocks: Block[] = [
    {
      id: 'block1',
      typeId: 'hero1',
      props: { title: 'Test Hero' },
      x: 0,
      y: 100,
      width: 1200,
      height: 600,
      z: 1,
      selected: false,
    },
    {
      id: 'block2',
      typeId: 'navbar1',
      props: { logo: 'Test Logo' },
      x: 0,
      y: 0,
      width: 1200,
      height: 80,
      z: 2,
      selected: false,
    },
    {
      id: 'block3',
      typeId: 'hero1', // Duplicate to test unique extraction
      props: { title: 'Another Hero' },
      x: 0,
      y: 700,
      width: 1200,
      height: 600,
      z: 3,
      selected: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('extractUniqueTemplates', () => {
    it('should extract unique template typeIds from blocks', () => {
      const result = extractUniqueTemplates(mockBlocks)

      expect(result).toBeInstanceOf(Set)
      expect(result.size).toBe(2)
      expect(result.has('hero1')).toBe(true)
      expect(result.has('navbar1')).toBe(true)
    })

    it('should handle empty blocks array', () => {
      const result = extractUniqueTemplates([])

      expect(result).toBeInstanceOf(Set)
      expect(result.size).toBe(0)
    })

    it('should handle blocks without typeId', () => {
      const blocksWithoutTypeId: Block[] = [
        { ...mockBlocks[0], typeId: '' } as any,
      ]

      const result = extractUniqueTemplates(blocksWithoutTypeId)

      expect(result.size).toBe(1)
      expect(result.has('')).toBe(true)
    })
  })

  describe('typeIdToComponentName', () => {
    it('should capitalize first letter of typeId', () => {
      expect(typeIdToComponentName('hero1')).toBe('Hero1')
      expect(typeIdToComponentName('navbar1')).toBe('Navbar1')
      expect(typeIdToComponentName('footer2')).toBe('Footer2')
    })

    it('should handle already capitalized typeIds', () => {
      expect(typeIdToComponentName('Hero1')).toBe('Hero1')
    })

    it('should handle single character typeIds', () => {
      expect(typeIdToComponentName('a')).toBe('A')
    })
  })

  describe('generateComponentFile', () => {
    it('should generate component file when source exists', () => {
      const mockSource = 'export function Hero1() { return <div>Hero</div> }'
      vi.mocked(templateSources.getTemplateSource).mockReturnValue(mockSource)

      const result = generateComponentFile('hero1')

      expect(result).not.toBeNull()
      expect(result?.path).toBe('src/components/Hero1.tsx')
      expect(result?.content).toBe(mockSource)
      expect(templateSources.getTemplateSource).toHaveBeenCalledWith('hero1')
    })

    it('should return null when source does not exist', () => {
      vi.mocked(templateSources.getTemplateSource).mockReturnValue(null)

      const result = generateComponentFile('nonexistent')

      expect(result).toBeNull()
      expect(templateSources.getTemplateSource).toHaveBeenCalledWith(
        'nonexistent'
      )
    })

    it('should log warning for missing source', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.mocked(templateSources.getTemplateSource).mockReturnValue(null)

      generateComponentFile('missing')

      expect(consoleSpy).toHaveBeenCalledWith(
        'No source found for template: missing'
      )
      consoleSpy.mockRestore()
    })
  })

  describe('resolveDependencies', () => {
    it('should return standard dependencies', () => {
      // Mock template sources with lucide-react icons to ensure it's included
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
            import { Menu } from 'lucide-react'
            export function Navbar1() {}
          `
        }
        return null
      })

      const result = resolveDependencies(mockBlocks)

      expect(result.dependencies).toContain('react')
      expect(result.dependencies).toContain('react-dom')
      expect(result.dependencies).toContain('lucide-react')
      expect(result.dependencies).toContain('clsx')
      expect(result.dependencies).toContain('tailwind-merge')

      expect(result.devDependencies).toContain('@types/react')
      expect(result.devDependencies).toContain('@types/react-dom')
      expect(result.devDependencies).toContain('vite')
      expect(result.devDependencies).toContain('typescript')
      expect(result.devDependencies).toContain('tailwindcss')
    })

    it('should handle empty blocks array', () => {
      const result = resolveDependencies([])

      expect(result.dependencies.size).toBeGreaterThan(0)
      expect(result.devDependencies.size).toBeGreaterThan(0)
    })
  })

  describe('generateAppComponent', () => {
    it('should generate App component with imports and blocks', () => {
      const result = generateAppComponent(mockBlocks)

      // Check imports
      expect(result).toContain("import { Hero1 } from './components/Hero1'")
      expect(result).toContain("import { Navbar1 } from './components/Navbar1'")

      // Check component structure
      expect(result).toContain('function App()')
      expect(result).toContain('export default App')

      // Check block rendering
      expect(result).toContain('key="block1"')
      expect(result).toContain('top: 100,')
      expect(result).toContain('zIndex: 1')
      expect(result).toContain('<Hero1')
      expect(result).toContain('<Navbar1')
    })

    it('should handle blocks with no props', () => {
      const blocksWithoutProps: Block[] = [
        { ...mockBlocks[0], props: undefined },
      ]

      const result = generateAppComponent(blocksWithoutProps)

      expect(result).toContain('{...{}}')
    })

    it('should handle empty blocks array', () => {
      const result = generateAppComponent([])

      expect(result).toContain('function App()')
      expect(result).not.toContain('import {')
    })
  })

  describe('generateShadcnComponents', () => {
    it('should generate required shadcn/ui components', () => {
      const result = generateShadcnComponents()

      expect(result).toHaveLength(4)

      const paths = result.map((f) => f.path)
      expect(paths).toContain('src/components/ui/button.tsx')
      expect(paths).toContain('src/components/ui/badge.tsx')
      expect(paths).toContain('src/components/ui/card.tsx')
      expect(paths).toContain('src/components/ui/input.tsx')

      // Check button content
      const button = result.find(
        (f) => f.path === 'src/components/ui/button.tsx'
      )
      expect(button?.content).toContain('export interface ButtonProps')
      expect(button?.content).toContain('const Button = React.forwardRef')
    })
  })

  describe('generateUtilityFiles', () => {
    it('should generate utility files', () => {
      const result = generateUtilityFiles()

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('src/lib/utils.ts')
      expect(result[0].content).toContain('export function cn')
      expect(result[0].content).toContain('twMerge(clsx(inputs))')
    })
  })

  describe('generateProjectFiles', () => {
    beforeEach(() => {
      vi.mocked(templateSources.getTemplateSource).mockImplementation(
        (typeId) => {
          if (typeId === 'hero1') return 'export function Hero1() {}'
          if (typeId === 'navbar1') return 'export function Navbar1() {}'
          return null
        }
      )
    })

    it('should generate all project files', () => {
      const result = generateProjectFiles(mockBlocks)

      // Check for component files
      const componentPaths = result
        .map((f) => f.path)
        .filter(
          (p) =>
            p.includes('components/Hero') || p.includes('components/Navbar')
        )
      expect(componentPaths).toContain('src/components/Hero1.tsx')
      expect(componentPaths).toContain('src/components/Navbar1.tsx')

      // Check for main files
      const paths = result.map((f) => f.path)
      expect(paths).toContain('src/App.tsx')
      expect(paths).toContain('src/index.tsx')
      expect(paths).toContain('src/globals.css')

      // Check for config files
      expect(paths).toContain('package.json')
      expect(paths).toContain('vite.config.ts')
      expect(paths).toContain('tsconfig.json')
      expect(paths).toContain('postcss.config.js')
      expect(paths).toContain('index.html')
      expect(paths).toContain('README.md')
    })

    it('should handle missing template sources gracefully', () => {
      vi.mocked(templateSources.getTemplateSource).mockReturnValue(null)

      const result = generateProjectFiles(mockBlocks)

      // Should still generate other files
      const paths = result.map((f) => f.path)
      expect(paths).toContain('src/App.tsx')
      expect(paths).toContain('package.json')
    })
  })

  describe('generateReactProject', () => {
    it('should generate ZIP blob', async () => {
      // Mock JSZip globally before the test
      const mockGenerateAsync = vi.fn().mockResolvedValue(new Blob(['test']))
      const mockFile = vi.fn()

      vi.mocked(templateSources.getTemplateSource).mockReturnValue(
        'export function Test() {}'
      )

      // Import JSZip and mock it directly
      const JSZip = (await import('jszip')).default
      vi.spyOn(JSZip.prototype, 'file').mockImplementation(mockFile)
      vi.spyOn(JSZip.prototype, 'generateAsync').mockImplementation(
        mockGenerateAsync
      )

      const result = await generateReactProject(mockBlocks)

      expect(result).toBeInstanceOf(Blob)
      expect(mockGenerateAsync).toHaveBeenCalledWith({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      })
    })
  })

  describe('downloadReactProject', () => {
    it('should trigger download', () => {
      const mockBlob = new Blob(['test'])
      const mockCreateElement = vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
      }))
      const mockCreateObjectURL = vi.fn(() => 'blob:url')
      const mockRevokeObjectURL = vi.fn()

      global.document.createElement = mockCreateElement as any
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL

      downloadReactProject(mockBlob, 'test.zip')

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url')
    })
  })

  describe('generateReactExportFilename', () => {
    it('should generate filename with timestamp', () => {
      const mockDate = new Date('2024-01-15T10:30:45')
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      const result = generateReactExportFilename()

      expect(result).toBe('draftcn-react-export-2024-01-15-103045.zip')

      vi.useRealTimers()
    })

    it('should pad single digit values', () => {
      const mockDate = new Date('2024-01-05T09:05:05')
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      const result = generateReactExportFilename()

      expect(result).toBe('draftcn-react-export-2024-01-05-090505.zip')

      vi.useRealTimers()
    })
  })
})
