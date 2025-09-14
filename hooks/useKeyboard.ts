import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { blocksSelectors } from '@/store/slices/blocks';

/**
 * Hook for handling keyboard events
 * Currently handles Delete/Backspace for deleting selected blocks
 */
export const useKeyboard = () => {
  const removeBlock = useAppStore((state) => state.removeBlock);
  const clearSelection = useAppStore((state) => state.clearSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Delete and Backspace keys
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Get current state directly from store
        const state = useAppStore.getState();
        const selectedIds = blocksSelectors.getSelectedBlockIds(state);

        // If there are selected blocks, delete them
        if (selectedIds.length > 0) {
          // Remove each selected block
          selectedIds.forEach((id) => {
            removeBlock(id);
          });

          // Clear selection after deletion
          clearSelection();
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [removeBlock, clearSelection]);
};