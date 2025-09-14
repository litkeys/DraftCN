import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useAppStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

// Mock blocks selectors
vi.mock('@/store/slices/blocks', () => ({
  blocksSelectors: {
    getSelectedBlockIds: vi.fn(),
  },
}));

describe('useKeyboard', () => {
  const mockRemoveBlock = vi.fn();
  const mockClearSelection = vi.fn();
  const mockGetState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default store mock
    (useAppStore as ReturnType<typeof vi.fn>).mockImplementation((selector: unknown) => {
      if (typeof selector === 'function') {
        const state = {
          removeBlock: mockRemoveBlock,
          clearSelection: mockClearSelection,
        };
        return (selector as (state: unknown) => unknown)(state);
      }
      return null;
    });

    // Add getState to useAppStore
    (useAppStore as { getState: () => unknown }).getState = mockGetState;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Delete key handling', () => {
    it('should delete selected blocks when Delete key is pressed', async () => {
      const { blocksSelectors } = await import('@/store/slices/blocks');

      // Mock selected blocks
      const selectedIds = ['block-1', 'block-2'];
      mockGetState.mockReturnValue({});
      (blocksSelectors.getSelectedBlockIds as ReturnType<typeof vi.fn>).mockReturnValue(selectedIds);

      // Render the hook
      renderHook(() => useKeyboard());

      // Simulate Delete key press
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      window.dispatchEvent(event);

      // Verify blocks were removed
      expect(mockRemoveBlock).toHaveBeenCalledTimes(2);
      expect(mockRemoveBlock).toHaveBeenCalledWith('block-1');
      expect(mockRemoveBlock).toHaveBeenCalledWith('block-2');
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });

    it('should delete selected blocks when Backspace key is pressed', async () => {
      const { blocksSelectors } = await import('@/store/slices/blocks');

      // Mock selected blocks
      const selectedIds = ['block-3'];
      mockGetState.mockReturnValue({});
      (blocksSelectors.getSelectedBlockIds as ReturnType<typeof vi.fn>).mockReturnValue(selectedIds);

      // Render the hook
      renderHook(() => useKeyboard());

      // Simulate Backspace key press
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      window.dispatchEvent(event);

      // Verify block was removed
      expect(mockRemoveBlock).toHaveBeenCalledTimes(1);
      expect(mockRemoveBlock).toHaveBeenCalledWith('block-3');
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });

    it('should not delete anything when no blocks are selected', async () => {
      const { blocksSelectors } = await import('@/store/slices/blocks');

      // Mock no selected blocks
      mockGetState.mockReturnValue({});
      (blocksSelectors.getSelectedBlockIds as ReturnType<typeof vi.fn>).mockReturnValue([]);

      // Render the hook
      renderHook(() => useKeyboard());

      // Simulate Delete key press
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      window.dispatchEvent(event);

      // Verify nothing was removed
      expect(mockRemoveBlock).not.toHaveBeenCalled();
      expect(mockClearSelection).not.toHaveBeenCalled();
    });

    it('should ignore other keys', async () => {
      const { blocksSelectors } = await import('@/store/slices/blocks');

      // Mock selected blocks
      const selectedIds = ['block-1'];
      mockGetState.mockReturnValue({});
      (blocksSelectors.getSelectedBlockIds as ReturnType<typeof vi.fn>).mockReturnValue(selectedIds);

      // Render the hook
      renderHook(() => useKeyboard());

      // Simulate other key presses
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      window.dispatchEvent(enterEvent);
      window.dispatchEvent(spaceEvent);
      window.dispatchEvent(escapeEvent);

      // Verify nothing was removed
      expect(mockRemoveBlock).not.toHaveBeenCalled();
      expect(mockClearSelection).not.toHaveBeenCalled();
    });

    it('should handle multiple selected blocks correctly', async () => {
      const { blocksSelectors } = await import('@/store/slices/blocks');

      // Mock multiple selected blocks
      const selectedIds = ['block-1', 'block-2', 'block-3', 'block-4'];
      mockGetState.mockReturnValue({});
      (blocksSelectors.getSelectedBlockIds as ReturnType<typeof vi.fn>).mockReturnValue(selectedIds);

      // Render the hook
      renderHook(() => useKeyboard());

      // Simulate Delete key press
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      window.dispatchEvent(event);

      // Verify all blocks were removed
      expect(mockRemoveBlock).toHaveBeenCalledTimes(4);
      selectedIds.forEach(id => {
        expect(mockRemoveBlock).toHaveBeenCalledWith(id);
      });
      expect(mockClearSelection).toHaveBeenCalledTimes(1);
    });

    it('should clear selection after deletion', async () => {
      const { blocksSelectors } = await import('@/store/slices/blocks');

      // Mock selected blocks
      const selectedIds = ['block-1'];
      mockGetState.mockReturnValue({});
      (blocksSelectors.getSelectedBlockIds as ReturnType<typeof vi.fn>).mockReturnValue(selectedIds);

      // Render the hook
      renderHook(() => useKeyboard());

      // Simulate Delete key press
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      window.dispatchEvent(event);

      // Verify selection was cleared after removal
      const callOrder: string[] = [];
      mockRemoveBlock.mock.calls.forEach(() => callOrder.push('remove'));
      mockClearSelection.mock.calls.forEach(() => callOrder.push('clear'));

      expect(callOrder[0]).toBe('remove');
      expect(callOrder[1]).toBe('clear');
    });
  });

  describe('Event listener cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      // Render and unmount the hook
      const { unmount } = renderHook(() => useKeyboard());
      unmount();

      // Verify event listener was removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should add event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      // Render the hook
      renderHook(() => useKeyboard());

      // Verify event listener was added
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});