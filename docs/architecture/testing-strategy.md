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
│       ├── selection.test.ts  # Selection state management
│       └── canvas.test.ts     # Canvas state
├── components/
│   ├── Canvas.test.tsx        # Canvas component
│   ├── Canvas.test.tsx        # Canvas with block rendering
│   └── BlockLibrary.test.tsx  # Sidebar tests
└── e2e/
    ├── drag-drop.test.ts      # Drag and drop flow
    ├── block-management.test.ts # Add/delete blocks
    └── multi-select.test.ts   # Multi-select operations
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
├── keyboard.spec.ts          # Keyboard shortcuts
├── multi-select.spec.ts      # Multi-select interactions
└── bulk-operations.spec.ts   # Bulk operations on multiple blocks
```

### Test Examples

#### Frontend Component Test

```typescript
// tests/unit/components/canvas/Canvas.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { Canvas } from '@/components/canvas/Canvas';
import { useAppStore } from '@/store';

describe('Canvas', () => {
  const mockBlock = {
    id: 'test-1',
    typeId: 'hero-1',
    props: { heading: 'Test' },
    x: 100,
    y: 200,
    width: 300,
    height: 400,
    z: 1
  };

  it('renders at correct position', () => {
    const { container } = render(
      <Canvas />
    );
    
    // Add block to store
    useAppStore.getState().addBlock(mockBlock);
    
    const blockElement = container.querySelector('[data-block-id="test-1"]');
    expect(blockElement?.style.left).toBe('100px');
    expect(blockElement?.style.top).toBe('200px');
  });

  it('shows selection state when selected', () => {
    const { container } = render(<Canvas />);

    // Add block to store
    useAppStore.getState().addBlock(mockBlock);

    // Select the block
    useAppStore.getState().selectBlock(mockBlock.id, 'replace');

    const blockElement = container.querySelector('[data-block-id="test-1"]');
    const isSelected = useAppStore.getState().selectedBlockIds.has(mockBlock.id);
    expect(isSelected).toBe(true);
    expect(blockElement).toHaveAttribute('data-selected', 'true');
  });

  it('handles multi-select with Ctrl+Click', () => {
    const { container } = render(<Canvas />);
    const block2 = { ...mockBlock, id: 'test-2', x: 400 };

    // Add blocks
    useAppStore.getState().addBlock(mockBlock);
    useAppStore.getState().addBlock(block2);

    // Ctrl+Click on first block
    const block1Element = container.querySelector('[data-block-id="test-1"]');
    fireEvent.click(block1Element, { ctrlKey: true });

    // Ctrl+Click on second block
    const block2Element = container.querySelector('[data-block-id="test-2"]');
    fireEvent.click(block2Element, { ctrlKey: true });

    // Both should be selected
    const selectedIds = useAppStore.getState().selectedBlockIds;
    expect(selectedIds.size).toBe(2);
    expect(selectedIds.has('test-1')).toBe(true);
    expect(selectedIds.has('test-2')).toBe(true);
  });
});

// tests/unit/store/selection.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/store';

describe('SelectionSlice', () => {
  beforeEach(() => {
    useAppStore.getState().clearSelection();
  });

  it('handles single selection mode', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.selectBlock('block-1', 'replace');
    });

    expect(result.current.selectedBlockIds).toEqual(['block-1']);

    act(() => {
      result.current.selectBlock('block-2', 'replace');
    });

    expect(result.current.selectedBlockIds).toEqual(['block-2']);
  });

  it('handles multi-select with toggle mode', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.selectBlock('block-1', 'toggle');
      result.current.selectBlock('block-2', 'toggle');
      result.current.selectBlock('block-3', 'toggle');
    });

    expect(result.current.selectedBlockIds).toHaveLength(3);

    // Toggle off block-2
    act(() => {
      result.current.selectBlock('block-2', 'toggle');
    });

    expect(result.current.selectedBlockIds).toHaveLength(2);
    expect(result.current.selectedBlockIds).not.toContain('block-2');
  });

  it('handles range selection', () => {
    const { result } = renderHook(() => useAppStore());

    // Add blocks in order
    const blocks = [
      { id: 'block-1', z: 1 },
      { id: 'block-2', z: 2 },
      { id: 'block-3', z: 3 },
      { id: 'block-4', z: 4 },
      { id: 'block-5', z: 5 }
    ];

    blocks.forEach(block => {
      result.current.addBlock(block);
    });

    act(() => {
      result.current.selectRange('block-2', 'block-4');
    });

    expect(result.current.selectedBlockIds).toEqual(['block-2', 'block-3', 'block-4']);
  });

  it('handles select all', () => {
    const { result } = renderHook(() => useAppStore());

    // Add multiple blocks
    ['block-1', 'block-2', 'block-3'].forEach(id => {
      result.current.addBlock({ id });
    });

    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedBlockIds).toHaveLength(3);
  });

  it('handles rectangle selection', () => {
    const { result } = renderHook(() => useAppStore());

    // Add blocks at different positions
    const blocks = [
      { id: 'block-1', x: 100, y: 100, width: 100, height: 100 },
      { id: 'block-2', x: 250, y: 150, width: 100, height: 100 },
      { id: 'block-3', x: 400, y: 300, width: 100, height: 100 }
    ];

    blocks.forEach(block => {
      result.current.addBlock(block);
    });

    // Select within bounds that includes block-1 and block-2
    act(() => {
      result.current.selectWithinBounds({
        x: 50,
        y: 50,
        width: 320,
        height: 250
      });
    });

    expect(result.current.selectedBlockIds).toHaveLength(2);
    expect(result.current.selectedBlockIds).toContain('block-1');
    expect(result.current.selectedBlockIds).toContain('block-2');
    expect(result.current.selectedBlockIds).not.toContain('block-3');
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

// tests/e2e/multi-select.spec.ts
import { test, expect } from '@playwright/test';

test('multi-select with Ctrl+Click', async ({ page }) => {
  await page.goto('/');

  // Add multiple blocks to canvas
  // ... (setup code)

  const block1 = await page.locator('[data-block-id="block-1"]');
  const block2 = await page.locator('[data-block-id="block-2"]');
  const block3 = await page.locator('[data-block-id="block-3"]');

  // Ctrl+Click to multi-select
  await block1.click();
  await block2.click({ modifiers: ['Control'] });
  await block3.click({ modifiers: ['Control'] });

  // Verify all are selected
  await expect(block1).toHaveAttribute('data-selected', 'true');
  await expect(block2).toHaveAttribute('data-selected', 'true');
  await expect(block3).toHaveAttribute('data-selected', 'true');
});

test('rectangle selection', async ({ page }) => {
  await page.goto('/');

  // Add multiple blocks
  // ... (setup code)

  const canvas = await page.locator('[data-canvas]');

  // Drag to select rectangle
  await canvas.dragTo(canvas, {
    sourcePosition: { x: 50, y: 50 },
    targetPosition: { x: 400, y: 400 }
  });

  // Verify blocks within bounds are selected
  const selectedBlocks = await page.locator('[data-selected="true"]');
  const count = await selectedBlocks.count();
  expect(count).toBeGreaterThan(0);
});

test('select all with Ctrl+A', async ({ page }) => {
  await page.goto('/');

  // Add multiple blocks
  // ... (setup code)

  // Press Ctrl+A
  await page.keyboard.press('Control+a');

  // Verify all blocks are selected
  const allBlocks = await page.locator('[data-block-id]');
  const selectedBlocks = await page.locator('[data-selected="true"]');

  const totalCount = await allBlocks.count();
  const selectedCount = await selectedBlocks.count();

  expect(selectedCount).toBe(totalCount);
});

test('bulk delete selected blocks', async ({ page }) => {
  await page.goto('/');

  // Add and select multiple blocks
  // ... (setup code)

  // Select multiple blocks
  await page.keyboard.press('Control+a');

  const initialCount = await page.locator('[data-block-id]').count();

  // Press Delete
  await page.keyboard.press('Delete');

  // Verify blocks are deleted
  const finalCount = await page.locator('[data-block-id]').count();
  expect(finalCount).toBe(0);
});
```
