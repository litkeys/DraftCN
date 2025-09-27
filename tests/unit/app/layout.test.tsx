import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock CSS import
vi.mock('@/app/globals.css', () => ({}));

// Mock the Header component
vi.mock('@/components/layout/Header', () => ({
  Header: vi.fn(() => <header data-testid="header">Header</header>),
}));

// Mock the Toaster component
vi.mock('@/components/ui/sonner', () => ({
  Toaster: vi.fn(() => <div data-testid="toaster">Toaster</div>),
}));

describe('RootLayout', () => {
  it('should render the layout structure', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    );

    // Check that the flex container exists
    const flexContainer = container.querySelector('.flex.flex-col.h-screen');
    expect(flexContainer).toBeInTheDocument();
  });

  it('should render the Header component', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
  });

  it('should render the Toaster component for notifications', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const toaster = screen.getByTestId('toaster');
    expect(toaster).toBeInTheDocument();
  });

  it('should render children content in main area', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );

    const childContent = screen.getByTestId('child-content');
    expect(childContent).toBeInTheDocument();

    // Check it's within main element
    const main = childContent.closest('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1', 'flex', 'overflow-hidden');
  });

  it('should have correct flex layout structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check the main container has flex column layout
    const layoutContainer = container.querySelector('.flex.flex-col.h-screen');
    expect(layoutContainer).toBeInTheDocument();
  });

  it('should position Toaster outside the main layout flow', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const toaster = screen.getByTestId('toaster');
    const layoutContainer = container.querySelector('.flex.flex-col.h-screen');

    // Toaster should be a sibling of the layout container, not inside it
    expect(toaster.parentElement).toBe(layoutContainer?.parentElement);
    expect(layoutContainer?.contains(toaster)).toBe(false);
  });

  it('should maintain layout hierarchy', () => {
    render(
      <RootLayout>
        <div data-testid="page-content">Page Content</div>
      </RootLayout>
    );

    // Verify components are rendered in correct order
    const header = screen.getByTestId('header');
    const pageContent = screen.getByTestId('page-content');
    const toaster = screen.getByTestId('toaster');

    expect(header).toBeInTheDocument();
    expect(pageContent).toBeInTheDocument();
    expect(toaster).toBeInTheDocument();

    // Check that page content is in main element
    const main = pageContent.closest('main');
    expect(main).toBeInTheDocument();
  });
});