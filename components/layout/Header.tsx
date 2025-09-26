import React from 'react'
import { ZoomControl } from './ZoomControl'
import { ExportButton } from './ExportButton'

export function Header() {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center px-6 relative">
      <div className="flex items-center flex-1">
        <h1 className="text-xl font-semibold text-foreground">DraftCN</h1>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <ZoomControl />
      </div>
      <div className="flex items-center justify-end flex-1">
        <ExportButton />
      </div>
    </header>
  )
}