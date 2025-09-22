'use client'

import React, { useEffect, useState, useRef } from 'react'
import { blockRegistry } from '@/lib/blocks/registry'
import type { BlockTemplate } from '@/types/template'
import { TemplateCard } from './TemplateCard'
import { Loader2, Search, X } from 'lucide-react'
import { useAppStore } from '@/store'
import { Input } from '@/components/ui/input'

export const BlockLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<BlockTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Block selection actions
  const clearSelection = useAppStore((state) => state.clearSelection)
  const registerSearchBlurCallback = useAppStore(
    (state) => state.registerSearchBlurCallback
  )

  const filterTemplatesBySearch = (
    templates: BlockTemplate[],
    query: string
  ): BlockTemplate[] => {
    if (!query.trim()) return templates

    const lowerQuery = query.toLowerCase()
    return templates.filter(
      (template) =>
        template.typeId.toLowerCase().includes(lowerQuery) ||
        template.name.toLowerCase().includes(lowerQuery) ||
        template.category.toLowerCase().includes(lowerQuery)
    )
  }

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setError(null)
        setLoading(true)

        // Simulate async loading for better UX
        await new Promise((resolve) => setTimeout(resolve, 100))

        const allTemplates = blockRegistry.getAllTemplates()
        const allCategories = blockRegistry.getCategories()

        setTemplates(allTemplates)
        setCategories(allCategories)
      } catch (error) {
        console.error('Failed to load templates:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load templates'
        )
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  // Register the search blur callback when component mounts
  useEffect(() => {
    const blurCallback = () => {
      if (searchInputRef.current) {
        searchInputRef.current.blur()
      }
    }

    registerSearchBlurCallback(blurCallback)
  }, [registerSearchBlurCallback])

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading block templates...</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 space-y-3">
        <div className="text-sm font-medium text-destructive">
          Error loading templates
        </div>
        <div className="text-xs text-muted-foreground">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-primary hover:underline"
        >
          Reload page
        </button>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="p-4 space-y-3">
        <div className="text-sm font-medium">No templates available</div>
        <div className="text-xs text-muted-foreground">
          Templates will appear here once they are registered in the system.
        </div>
      </div>
    )
  }

  // Check if search has no results across all categories
  const hasSearchResults =
    searchQuery.trim() &&
    categories.some((category) => {
      const categoryTemplates = blockRegistry.getTemplatesByCategory(category)
      const filteredTemplates = filterTemplatesBySearch(
        categoryTemplates,
        searchQuery
      )
      return filteredTemplates.length > 0
    })

  const showNoResults = searchQuery.trim() && !hasSearchResults

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold">Block Library</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => clearSelection()}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {showNoResults ? (
        <div className="text-sm text-muted-foreground">No blocks found</div>
      ) : categories.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No categories available. Templates need to be organized into
          categories.
        </div>
      ) : (
        categories.map((category) => {
          const categoryTemplates =
            blockRegistry.getTemplatesByCategory(category)
          const filteredTemplates = filterTemplatesBySearch(
            categoryTemplates,
            searchQuery
          )

          // Only show category if it has matching templates
          if (filteredTemplates.length === 0) {
            return null
          }

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </h3>
              <div className="grid gap-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.typeId} template={template} />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
