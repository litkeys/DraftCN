import React from 'react'
import Image from 'next/image'
import { ZoomControl } from './ZoomControl'
import { ImportButton } from './ImportButton'
import { ExportButton } from './ExportButton'

export function Header() {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center px-6 relative">
      <div className="flex items-center flex-1">
        <Image
          src="/draftcn-logo.png"
          alt="DraftCN Logo"
          width={32}
          height={32}
          className="rounded-sm -translate-x-2.5"
        />
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <ZoomControl />
      </div>
      <div className="flex items-center justify-end flex-1 gap-2">
        <ImportButton />
        <ExportButton />
      </div>
    </header>
  )
}
