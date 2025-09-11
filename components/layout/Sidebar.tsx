import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BlockLibrary } from '@/components/blocks/BlockLibrary'
import { BlockLibraryErrorBoundary } from '@/components/blocks/BlockLibraryErrorBoundary'

export function Sidebar() {
  return (
    <aside className="w-1/5 min-w-64 bg-sidebar border-r border-sidebar-border">
      {/* 
        h-full relies on parent flex container (main) 
        If layout structure changes, revisit this height calculation 
      */}
      <ScrollArea className="h-full">
        <BlockLibraryErrorBoundary>
          <BlockLibrary />
        </BlockLibraryErrorBoundary>
      </ScrollArea>
    </aside>
  )
}
