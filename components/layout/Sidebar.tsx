import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Sidebar() {
  return (
    <aside className="w-1/5 min-w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-4">
        <h2 className="text-lg font-medium text-sidebar-foreground mb-4">
          Block Library
        </h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            <p className="text-sm text-sidebar-foreground/70">
              Block templates will appear here...
            </p>
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}