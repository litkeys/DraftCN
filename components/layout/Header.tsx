import React from 'react'

export function Header() {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-foreground">DraftCN</h1>
      </div>
    </header>
  )
}