import { describe, it, expect, beforeEach } from 'vitest';
import { createBlocksSlice, blocksSelectors } from '@/store/slices/blocks';
import type { Block } from '@/types';

describe('BlocksSlice', () => {
  let store: ReturnType<typeof createBlocksSlice>;
  let setState: (partial: unknown) => void;
  let getState: () => ReturnType<typeof createBlocksSlice>;

  beforeEach(() => {
    const stateContainer: { state: ReturnType<typeof createBlocksSlice> } = {
      state: {} as ReturnType<typeof createBlocksSlice>
    };
    setState = (partial: unknown) => {
      if (typeof partial === 'function') {
        const newState = (partial as (state: ReturnType<typeof createBlocksSlice>) => Partial<ReturnType<typeof createBlocksSlice>>)(stateContainer.state);
        stateContainer.state = { ...stateContainer.state, ...newState };
      } else {
        stateContainer.state = { ...stateContainer.state, ...(partial as Partial<ReturnType<typeof createBlocksSlice>>) };
      }
    };
    getState = () => stateContainer.state;
    store = createBlocksSlice(
      setState as Parameters<typeof createBlocksSlice>[0],
      getState as Parameters<typeof createBlocksSlice>[1],
      {} as Parameters<typeof createBlocksSlice>[2]
    );
    stateContainer.state = store;
  });

  describe('Selection Management', () => {
    const block1: Block = {
      id: 'block-1',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      z: 1,
      typeId: 'test',
      props: {},
      selected: false,
    };

    const block2: Block = {
      id: 'block-2',
      x: 200,
      y: 200,
      width: 200,
      height: 150,
      z: 2,
      typeId: 'test',
      props: {},
      selected: false,
    };

    beforeEach(() => {
      getState().addBlock(block1);
      getState().addBlock(block2);
    });

    describe('selectBlock', () => {
      it('should select a single block and update selectedBlockIds', () => {
        getState().selectBlock('block-1');
        const state = getState();

        expect(state.selectedBlockIds).toEqual(['block-1']);
        expect(state.blocks.find((b: Block) => b.id === 'block-1')?.selected).toBe(true);
        expect(state.blocks.find((b: Block) => b.id === 'block-2')?.selected).toBe(false);
      });

      it('should deselect other blocks when selecting a new one', () => {
        getState().selectBlock('block-1');
        getState().selectBlock('block-2');
        const state = getState();

        expect(state.selectedBlockIds).toEqual(['block-2']);
        expect(state.blocks.find((b: Block) => b.id === 'block-1')?.selected).toBe(false);
        expect(state.blocks.find((b: Block) => b.id === 'block-2')?.selected).toBe(true);
      });

      it('should synchronize block.selected field with selectedBlockIds', () => {
        getState().selectBlock('block-1');
        const state = getState();

        const selectedBlocks = state.blocks.filter((b: Block) => b.selected);
        expect(selectedBlocks).toHaveLength(1);
        expect(selectedBlocks[0].id).toBe('block-1');
        expect(state.selectedBlockIds).toEqual(['block-1']);
      });
    });

    describe('clearSelection', () => {
      it('should clear selectedBlockIds array', () => {
        getState().selectBlock('block-1');
        getState().clearSelection();
        const state = getState();

        expect(state.selectedBlockIds).toEqual([]);
      });

      it('should set all blocks.selected to false', () => {
        getState().selectBlock('block-1');
        getState().clearSelection();
        const state = getState();

        expect(state.blocks.every((b: Block) => !b.selected)).toBe(true);
      });

      it('should synchronize clearing with block.selected fields', () => {
        getState().selectBlock('block-1');
        getState().selectBlock('block-2');
        getState().clearSelection();
        const state = getState();

        expect(state.selectedBlockIds).toHaveLength(0);
        expect(state.blocks.filter((b: Block) => b.selected)).toHaveLength(0);
      });
    });

    describe('addBlock', () => {
      it('should initialize new blocks with selected: false', () => {
        const newBlock: Block = {
          id: 'block-3',
          x: 300,
          y: 300,
          width: 200,
          height: 150,
          z: 3,
          typeId: 'test',
          props: {},
          selected: true, // Try to add with selected: true
        };

        getState().addBlock(newBlock);
        const state = getState();
        const addedBlock = state.blocks.find((b: Block) => b.id === 'block-3');

        expect(addedBlock?.selected).toBe(false);
      });
    });

    describe('removeBlock', () => {
      it('should remove block from selectedBlockIds when deleted', () => {
        getState().selectBlock('block-1');
        getState().removeBlock('block-1');
        const state = getState();

        expect(state.selectedBlockIds).not.toContain('block-1');
        expect(state.blocks.find((b: Block) => b.id === 'block-1')).toBeUndefined();
      });

      it('should handle removing non-selected blocks', () => {
        getState().selectBlock('block-1');
        getState().removeBlock('block-2');
        const state = getState();

        expect(state.selectedBlockIds).toEqual(['block-1']);
        expect(state.blocks.find((b: Block) => b.id === 'block-2')).toBeUndefined();
      });
    });

    describe('clearBlocks', () => {
      it('should clear both blocks and selectedBlockIds', () => {
        getState().selectBlock('block-1');
        getState().clearBlocks();
        const state = getState();

        expect(state.blocks).toEqual([]);
        expect(state.selectedBlockIds).toEqual([]);
      });
    });
  });

  describe('Selection Selectors', () => {
    const block1: Block = {
      id: 'block-1',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      z: 1,
      typeId: 'test',
      props: {},
      selected: false,
    };

    beforeEach(() => {
      getState().addBlock(block1);
    });

    describe('getSelectedBlockIds', () => {
      it('should return array of selected block IDs', () => {
        getState().selectBlock('block-1');
        const state = getState();

        expect(blocksSelectors.getSelectedBlockIds(state)).toEqual(['block-1']);
      });

      it('should return empty array when no selection', () => {
        const state = getState();
        expect(blocksSelectors.getSelectedBlockIds(state)).toEqual([]);
      });
    });

    describe('hasSelection', () => {
      it('should return true when blocks are selected', () => {
        getState().selectBlock('block-1');
        const state = getState();

        expect(blocksSelectors.hasSelection(state)).toBe(true);
      });

      it('should return false when no blocks are selected', () => {
        const state = getState();
        expect(blocksSelectors.hasSelection(state)).toBe(false);
      });
    });

    describe('isBlockSelected', () => {
      it('should return true for selected block', () => {
        getState().selectBlock('block-1');
        const state = getState();

        expect(blocksSelectors.isBlockSelected(state, 'block-1')).toBe(true);
      });

      it('should return false for non-selected block', () => {
        const state = getState();
        expect(blocksSelectors.isBlockSelected(state, 'block-1')).toBe(false);
      });
    });
  });

  describe('Selection State Persistence', () => {
    it('should maintain selection after state changes', () => {
      const block1: Block = {
        id: 'block-1',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        z: 1,
        typeId: 'test',
        props: {},
        selected: false,
      };

      getState().addBlock(block1);
      getState().selectBlock('block-1');

      // Update block position
      getState().updateBlock('block-1', { x: 150, y: 150 });
      const state = getState();

      expect(state.selectedBlockIds).toEqual(['block-1']);
      expect(state.blocks.find((b: Block) => b.id === 'block-1')?.selected).toBe(true);
      expect(state.blocks.find((b: Block) => b.id === 'block-1')?.x).toBe(150);
    });
  });
});