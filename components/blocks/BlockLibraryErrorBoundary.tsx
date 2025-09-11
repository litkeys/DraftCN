"use client"

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class BlockLibraryErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BlockLibrary Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 space-y-3">
          <div className="text-sm font-medium text-destructive">
            Error loading block library
          </div>
          <div className="text-xs text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}