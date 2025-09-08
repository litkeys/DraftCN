# Testing Strategy

### Testing Pyramid

```text
        E2E Tests (Few)
       /              \
    Integration Tests (Some)
    /                    \
Unit Tests (Many)    Component Tests (Many)
```

### Test Organization

#### Frontend Tests

```text
tests/
├── unit/
│   ├── lib/
│   │   ├── grid.test.ts       # Grid calculations
│   │   ├── drag.test.ts       # Drag manager logic
│   │   └── processor.test.ts  # Template processor
│   └── store/
│       ├── blocks.test.ts     # Block state management
│       └── canvas.test.ts     # Canvas state
├── components/
│   ├── Canvas.test.tsx        # Canvas component
│   ├── BlockInstance.test.tsx # Block rendering
│   └── BlockLibrary.test.tsx  # Sidebar tests
└── e2e/
    ├── drag-drop.test.ts      # Drag and drop flow
    └── block-management.test.ts # Add/delete blocks
```

#### Backend Tests

```text
N/A - No backend for MVP
```

#### E2E Tests

```text
tests/e2e/
├── fixtures/
│   └── templates.json         # Test templates
├── drag-drop.spec.ts         # Full drag-drop workflow
├── grid-snapping.spec.ts     # Grid system behavior
└── keyboard.spec.ts          # Keyboard shortcuts
```

### Test Examples

#### Frontend Component Test

```typescript
// tests/components/BlockInstance.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { BlockInstance } from '@/components/blocks/BlockInstance';

describe('BlockInstance', () => {
  const mockBlock = {
    id: 'test-1',
    typeId: 'hero-1',
    props: { heading: 'Test' },
    x: 100,
    y: 200,
    width: 300,
    height: 400,
    z: 1,
    selected: false
  };

  it('renders at correct position', () => {
    const { container } = render(
      <BlockInstance block={mockBlock} />
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.style.left).toBe('100px');
    expect(element.style.top).toBe('200px');
  });

  it('shows selection state when selected', () => {
    const { container, rerender } = render(
      <BlockInstance block={mockBlock} />
    );
    
    rerender(
      <BlockInstance block={{...mockBlock, selected: true}} />
    );
    
    const element = container.firstChild as HTMLElement;
    expect(element.classList.contains('ring-2')).toBe(true);
  });
});
```

#### Backend API Test

```typescript
// N/A - No backend for MVP
```

#### E2E Test

```typescript
// tests/e2e/drag-drop.spec.ts
import { test, expect } from '@playwright/test';

test('drag block from library to canvas', async ({ page }) => {
  await page.goto('/');
  
  // Find template in sidebar
  const template = await page.locator('[data-template-id="hero-1"]');
  const canvas = await page.locator('[data-canvas]');
  
  // Drag template to canvas
  await template.dragTo(canvas, {
    targetPosition: { x: 300, y: 300 }
  });
  
  // Verify block was added
  const block = await page.locator('[data-block-id]').first();
  await expect(block).toBeVisible();
  
  // Verify grid snapping
  const boundingBox = await block.boundingBox();
  expect(boundingBox?.x).toBe(300); // Snapped to grid
  expect(boundingBox?.y).toBe(300);
});
```
