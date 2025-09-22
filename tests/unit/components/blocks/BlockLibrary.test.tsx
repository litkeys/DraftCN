import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const mockClearSelection = vi.fn()
const mockRegisterSearchBlurCallback = vi.fn()
const mockSetDragState = vi.fn()
const mockClearDragState = vi.fn()

vi.mock('@/store', () => ({
  useAppStore: (selector: any) => {
    const mockState = {
      clearSelection: mockClearSelection,
      registerSearchBlurCallback: mockRegisterSearchBlurCallback,
      setDragState: mockSetDragState,
      clearDragState: mockClearDragState,
    }
    return selector(mockState)
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
    mockClearSelection.mockClear()
    mockRegisterSearchBlurCallback.mockClear()
    mockSetDragState.mockClear()
    mockClearDragState.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading States', () => {
    it('should display loading state with spinner and skeleton cards', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockTemplates), 100)
          )
      )
      vi.mocked(blockRegistry.getCategories).mockReturnValue([
        'Heroes',
        'Navigation',
      ])

      render(<BlockLibrary />)

      expect(screen.getByText('Loading block templates...')).toBeInTheDocument()

      const skeletons = screen
        .getAllByRole('generic')
        .filter((el) => el.className.includes('animate-pulse'))
      expect(skeletons).toHaveLength(3)
    })

    it('should display templates after loading', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue([
        'Heroes',
        'Navigation',
      ])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation(
        (category) => {
          return mockTemplates.filter((t) => t.category === category)
        }
      )

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
        expect(
          screen.getByText(
            'Templates will appear here once they are registered in the system.'
          )
        ).toBeInTheDocument()
      })
    })

    it('should not display empty categories when search is active', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue([
        'Heroes',
        'Navigation',
        'Empty Category',
      ])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation(
        (category) => {
          if (category === 'Empty Category') return []
          return mockTemplates.filter((t) => t.category === category)
        }
      )

      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Heroes')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'test')

      // Empty Category should not be displayed when no templates match
      expect(screen.queryByText('Empty Category')).not.toBeInTheDocument()
    })

    it('should display message when no categories exist', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue([])

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'No categories available. Templates need to be organized into categories.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('Template Display', () => {
    it('should group templates by category correctly', async () => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue([
        'Heroes',
        'Navigation',
      ])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation(
        (category) => {
          return mockTemplates.filter((t) => t.category === category)
        }
      )

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
      vi.mocked(blockRegistry.getCategories).mockReturnValue([
        'Heroes',
        'Navigation',
      ])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation(
        (category) => {
          return mockTemplates.filter((t) => t.category === category)
        }
      )

      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
        expect(screen.getByText('Navigation Bar')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    beforeEach(() => {
      vi.mocked(blockRegistry.getAllTemplates).mockReturnValue(mockTemplates)
      vi.mocked(blockRegistry.getCategories).mockReturnValue([
        'Heroes',
        'Navigation',
      ])
      vi.mocked(blockRegistry.getTemplatesByCategory).mockImplementation(
        (category) => {
          return mockTemplates.filter((t) => t.category === category)
        }
      )
    })

    it('should render search input with placeholder', async () => {
      render(<BlockLibrary />)

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search blocks...')
        expect(searchInput).toBeInTheDocument()
      })
    })

    it('should filter templates by typeId match', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'hero1')

      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()
    })

    it('should filter templates by name match', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'Navigation')

      expect(screen.queryByText('Hero Section')).not.toBeInTheDocument()
      expect(screen.getByText('Navigation Bar')).toBeInTheDocument()
    })

    it('should filter templates by category match', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'Heroes')

      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()
    })

    it('should perform case-insensitive search', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'HERO')

      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()
    })

    it('should show clear button when text is entered', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Block Library')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')

      // Clear button should not exist initially
      expect(screen.queryByRole('button')).not.toBeInTheDocument()

      // Type some text
      await user.type(searchInput, 'test')

      // Clear button should appear
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('should hide clear button when search is empty', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Block Library')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'test')

      // Clear button should exist
      expect(screen.getByRole('button')).toBeInTheDocument()

      // Clear the input
      await user.clear(searchInput)

      // Clear button should disappear
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should clear search and restore all templates on clear click', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
        expect(screen.getByText('Navigation Bar')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'hero')

      // Only hero should be visible
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()

      // Click clear button
      const clearButton = screen.getByRole('button')
      await user.click(clearButton)

      // All templates should be visible again
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.getByText('Navigation Bar')).toBeInTheDocument()

      // Search input should be empty
      expect(searchInput).toHaveValue('')
    })

    it('should show "No blocks found" for empty results', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'nonexistent')

      expect(screen.getByText('No blocks found')).toBeInTheDocument()
      expect(screen.queryByText('Hero Section')).not.toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()
    })

    it('should maintain search during drag operations', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')
      await user.type(searchInput, 'hero')

      // Only hero should be visible
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()

      // Simulate starting a drag (mousedown on template)
      const heroTemplate = screen
        .getByText('Hero Section')
        .closest('[data-template-id]')
      fireEvent.mouseDown(heroTemplate!)

      // Search should still be active
      expect(searchInput).toHaveValue('hero')
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()

      // Simulate ending drag
      fireEvent.mouseUp(document.body)

      // Search should still be maintained
      expect(searchInput).toHaveValue('hero')
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()
    })

    it('should update results in real-time as user types', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Hero Section')).toBeInTheDocument()
        expect(screen.getByText('Navigation Bar')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')

      // Type 'h'
      await user.type(searchInput, 'h')
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()

      // Type 'e' (now 'he')
      await user.type(searchInput, 'e')
      expect(screen.getByText('Hero Section')).toBeInTheDocument()
      expect(screen.queryByText('Navigation Bar')).not.toBeInTheDocument()

      // Clear and type 'nav'
      await user.clear(searchInput)
      await user.type(searchInput, 'nav')
      expect(screen.queryByText('Hero Section')).not.toBeInTheDocument()
      expect(screen.getByText('Navigation Bar')).toBeInTheDocument()
    })

    it('should clear canvas block selection when search input is focused', async () => {
      const user = userEvent.setup()
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Block Library')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search blocks...')

      // Focus the search input
      await user.click(searchInput)

      // Verify clearSelection was called
      expect(mockClearSelection).toHaveBeenCalledTimes(1)
    })

    it('should register search blur callback when component mounts', async () => {
      render(<BlockLibrary />)

      await waitFor(() => {
        expect(screen.getByText('Block Library')).toBeInTheDocument()
      })

      // Verify registerSearchBlurCallback was called
      expect(mockRegisterSearchBlurCallback).toHaveBeenCalledTimes(1)
      expect(mockRegisterSearchBlurCallback).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })
  })
})
