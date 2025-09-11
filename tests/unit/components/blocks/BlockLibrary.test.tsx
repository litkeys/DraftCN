import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BlockLibrary } from '@/components/blocks/BlockLibrary'
import { blockRegistry } from '@/lib/blocks/registry'
import type { BlockTemplate } from '@/types/template'

vi.mock('@/lib/blocks/registry', () => ({
  blockRegistry: {
    getAllTemplates: vi.fn(),
    getCategories: vi.fn(),
    getTemplatesByCategory: vi.fn(),
  },
}))

describe('BlockLibrary', () => {
  const mockTemplates: BlockTemplate[] = [
    {
      typeId: 'hero1',
      name: 'Hero Section',
      category: 'Heroes',
      thumbnail: 'data:image/png;base64,test',
      component: () => null,
      dependencies: [],
      defaultProps: {},
      defaultWidth: 1200,
      defaultHeight: 400,
      minimumWidth: 600,
      minimumHeight: 200,
    },
    {
      typeId: 'navbar1',
      name: 'Navigation Bar',
      category: 'Navigation',
      thumbnail: 'data:image/png;base64,test2',
      component: () => null,
      dependencies: [],
      defaultProps: {},
      defaultWidth: 1200,
      defaultHeight: 400,
      minimumWidth: 600,
      minimumHeight: 200,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading States', () => {
    it('should display loading state with spinner and skeleton cards', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockImplementation(() => {
        return new Promise((resolve) => setTimeout(() => resolve(mockTemplates), 100))
      })
      vi.mocked(blockRegistry.getCategories).mockReturnValue(['Heroes', 'Navigation'])

      render(<BlockLibrary />)

      expect(screen.getByText('Loading block templates...')).toBeInTheDocument()
      
      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      )
      expect(skeletons).toHaveLength(3)
    })

    it('should display templates after loading', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue(['Heroes', 'Navigation'])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation((category) => {
        return mockTemplates.filter(t => t.category === category)
      })

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Block Library')).toBeInTheDocument()
        expect(screen.getByText('Heroes')).toBeInTheDocument()
        expect(screen.getByText('Navigation')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when templates fail to load', async () => {
      const errorMessage = 'Failed to fetch templates'
      vi.mocked(blockRegistry.getAllTemplates).mockImplementation(() => {
        throw new Error(errorMessage)
      })

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Error loading templates')).toBeInTheDocument()
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
        expect(screen.getByText('Reload page')).toBeInTheDocument()
      })
    })

    it('should handle non-Error exceptions gracefully', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockImplementation(() => {
        throw 'String error'
      })

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Error loading templates')).toBeInTheDocument()
        expect(screen.getByText('Failed to load templates')).toBeInTheDocument()
      })
    })
  })

  describe('Empty States', () => {
    it('should display helpful message when no templates are available', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue([])
      vi.mocked(blockRegistry.getCategories).mockReturnValue([])

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('No templates available')).toBeInTheDocument()
        expect(screen.getByText('Templates will appear here once they are registered in the system.')).toBeInTheDocument()
      })
    })

    it('should display message for empty categories', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue(['Heroes', 'Navigation', 'Empty Category'])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation((category) => {
        if (category === 'Empty Category') return []
        return mockTemplates.filter(t => t.category === category)
      })

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Empty Category')).toBeInTheDocument()
        expect(screen.getByText('No templates in this category yet')).toBeInTheDocument()
      })
    })

    it('should display message when no categories exist', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue([])

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('No categories available. Templates need to be organized into categories.')).toBeInTheDocument()
      })
    })
  })

  describe('Template Display', () => {
    it('should group templates by category correctly', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue(['Heroes', 'Navigation'])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation((category) => {
        return mockTemplates.filter(t => t.category === category)
      })

      render(<BlockLibrary />)

      await waitFor(() => {
        const heroSection = screen.getByText('Heroes').parentElement
        expect(heroSection).toHaveTextContent('Hero Section')
        
        const navSection = screen.getByText('Navigation').parentElement
        expect(navSection).toHaveTextContent('Navigation Bar')
      })
    })

    it('should render all templates from registry', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue(['Heroes', 'Navigation'])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation((category) => {
        return mockTemplates.filter(t => t.category === category)
      })

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
        expect(screen.getByText('Navigation Bar')).toBeInTheDocument()
      })
    })
  })
})