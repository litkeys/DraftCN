import { describe, it, expect } from 'vitest'
import {
  templateSources,
  getTemplateSource,
  getAvailableTemplates,
  hasTemplateSource,
} from '@/lib/blocks/template-sources'

describe('template-sources', () => {
  describe('templateSources', () => {
    it('should contain all required templates', () => {
      const requiredTemplates = [
        'hero1',
        'navbar1',
        'footer2',
        'feature43',
        'blog7',
        'about3',
      ]
      requiredTemplates.forEach((templateId) => {
        expect(templateSources[templateId]).toBeDefined()
        expect(typeof templateSources[templateId]).toBe('string')
      })
    })

    it('should have pre-processed import paths', () => {
      // Check that imports are converted from @/components/ui/* to ./ui/*
      const hero1Source = templateSources['hero1']
      expect(hero1Source).toContain("import { Badge } from './ui/badge'")
      expect(hero1Source).toContain("import { Button } from './ui/button'")
      expect(hero1Source).not.toContain('@/components/ui/')

      const navbar1Source = templateSources['navbar1']
      expect(navbar1Source).toContain("from './ui/accordion'")
      expect(navbar1Source).toContain("from './ui/navigation-menu'")
      expect(navbar1Source).not.toContain('@/components/ui/')
    })

    it('should preserve lucide-react imports', () => {
      const hero1Source = templateSources['hero1']
      expect(hero1Source).toContain("from 'lucide-react'")

      const navbar1Source = templateSources['navbar1']
      expect(navbar1Source).toContain(
        "import { Book, Menu, Sunset, Trees, Zap } from 'lucide-react'"
      )
    })

    it('should contain TypeScript interfaces', () => {
      const hero1Source = templateSources['hero1']
      expect(hero1Source).toContain('interface Hero1Props')

      const navbar1Source = templateSources['navbar1']
      expect(navbar1Source).toContain('interface MenuItem')
      expect(navbar1Source).toContain('interface Navbar1Props')
    })

    it('should have proper export statements', () => {
      const templates = [
        'hero1',
        'navbar1',
        'footer2',
        'feature43',
        'blog7',
        'about3',
      ]
      templates.forEach((templateId) => {
        const source = templateSources[templateId]
        const componentName =
          templateId.charAt(0).toUpperCase() + templateId.slice(1)
        expect(source).toContain(
          `export { ${componentName.replace(/\d+$/, (match) => match)} }`
        )
      })
    })

    it('should include component implementations', () => {
      const hero1Source = templateSources['hero1']
      expect(hero1Source).toContain('const Hero1 =')
      expect(hero1Source).toContain('return (')
    })

    it('should handle shadcnblocks imports correctly', () => {
      const footer2Source = templateSources['footer2']
      expect(footer2Source).toContain(
        "import { Logo, LogoImage, LogoText } from './logo'"
      )
      expect(footer2Source).not.toContain('@/components/shadcnblocks/')
    })
  })

  describe('getTemplateSource', () => {
    it('should return template source for valid typeId', () => {
      const source = getTemplateSource('hero1')
      expect(source).toBeDefined()
      expect(typeof source).toBe('string')
      expect(source).toContain('Hero1')
    })

    it('should return undefined for invalid typeId', () => {
      const source = getTemplateSource('nonexistent')
      expect(source).toBeUndefined()
    })

    it('should return the correct template for each typeId', () => {
      const testCases = [
        { typeId: 'hero1', expectedContent: 'Hero1Props' },
        { typeId: 'navbar1', expectedContent: 'Navbar1Props' },
        { typeId: 'footer2', expectedContent: 'Footer2Props' },
        { typeId: 'feature43', expectedContent: 'Feature43Props' },
        { typeId: 'blog7', expectedContent: 'Blog7Props' },
        { typeId: 'about3', expectedContent: 'About3Props' },
      ]

      testCases.forEach(({ typeId, expectedContent }) => {
        const source = getTemplateSource(typeId)
        expect(source).toContain(expectedContent)
      })
    })
  })

  describe('getAvailableTemplates', () => {
    it('should return array of template typeIds', () => {
      const templates = getAvailableTemplates()
      expect(Array.isArray(templates)).toBe(true)
      expect(templates.length).toBeGreaterThan(0)
    })

    it('should include all expected templates', () => {
      const templates = getAvailableTemplates()
      const expectedTemplates = [
        'hero1',
        'navbar1',
        'footer2',
        'feature43',
        'blog7',
        'about3',
      ]
      expectedTemplates.forEach((templateId) => {
        expect(templates).toContain(templateId)
      })
    })

    it('should return only string values', () => {
      const templates = getAvailableTemplates()
      templates.forEach((templateId) => {
        expect(typeof templateId).toBe('string')
      })
    })
  })

  describe('hasTemplateSource', () => {
    it('should return true for existing templates', () => {
      const existingTemplates = [
        'hero1',
        'navbar1',
        'footer2',
        'feature43',
        'blog7',
        'about3',
      ]
      existingTemplates.forEach((templateId) => {
        expect(hasTemplateSource(templateId)).toBe(true)
      })
    })

    it('should return false for non-existing templates', () => {
      expect(hasTemplateSource('nonexistent')).toBe(false)
      expect(hasTemplateSource('hero99')).toBe(false)
      expect(hasTemplateSource('')).toBe(false)
    })
  })

  describe('template content validation', () => {
    it('should have valid TypeScript/React syntax markers', () => {
      const templates = getAvailableTemplates()
      templates.forEach((templateId) => {
        const source = getTemplateSource(templateId)!
        // Check for React component structure
        expect(source).toContain('return (')
        expect(source).toContain('className=')
        // Check for TypeScript types (interface or type keyword)
        const hasTypeDefinition = source.includes('interface') || source.includes('type ')
        expect(hasTypeDefinition).toBe(true)
      })
    })

    it('should contain default prop values', () => {
      const hero1Source = templateSources['hero1']
      expect(hero1Source).toContain("badge = '✨ Your Website Builder'")
      expect(hero1Source).toContain(
        "heading = 'Blocks Built With Shadcn & Tailwind'"
      )

      const navbar1Source = templateSources['navbar1']
      expect(navbar1Source).toContain("title: 'Home'")
      expect(navbar1Source).toContain("title: 'Products'")
    })

    it('should have consistent formatting', () => {
      const templates = getAvailableTemplates()
      templates.forEach((templateId) => {
        const source = getTemplateSource(templateId)!
        // Check for consistent spacing and formatting
        expect(source).not.toContain('\t') // No tabs, using spaces
        expect(source).toContain('  ') // Has indentation
      })
    })
  })

  describe('import path conversions', () => {
    it('should convert all UI component imports correctly', () => {
      const uiComponents = [
        'badge',
        'button',
        'accordion',
        'navigation-menu',
        'sheet',
        'card',
      ]

      Object.values(templateSources).forEach((source) => {
        // Check that no @/components/ui imports remain
        expect(source).not.toContain('@/components/ui/')

        // Check that UI imports use relative paths (handles both single and double quotes)
        if (source.includes('Badge')) {
          const hasCorrectImport =
            source.includes("from './ui/badge'") ||
            source.includes('from "./ui/badge"')
          expect(hasCorrectImport).toBe(true)
        }
        if (source.includes('Button')) {
          const hasCorrectImport =
            source.includes("from './ui/button'") ||
            source.includes('from "./ui/button"')
          expect(hasCorrectImport).toBe(true)
        }
      })
    })

    it('should convert shadcnblocks component imports', () => {
      const footer2Source = templateSources['footer2']
      expect(footer2Source).not.toContain('@/components/shadcnblocks/')
      expect(footer2Source).toContain('./logo')
    })
  })
})
