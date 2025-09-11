import { StateCreator } from 'zustand';
import type { Block } from '@/types';

/**
 * Blocks state interface
 */
export interface BlocksState {
  blocks: Block[];
}

/**
 * Blocks actions interface
 */
export interface BlocksActions {
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  clearBlocks: () => void;
  getHighestZIndex: () => number;
}

/**
 * Combined blocks slice type
 */
export type BlocksSlice = BlocksState & BlocksActions;

/**
 * Initial blocks state
 */
const initialBlocksState: BlocksState = {
  blocks: [],
};

/**
 * Create blocks slice for Zustand store
 */
export const createBlocksSlice: StateCreator<BlocksSlice> = (set, get) => ({
  // Initial state
  ...initialBlocksState,

  // Actions
  addBlock: (block) =>
    set((state) => ({
      blocks: [...state.blocks, block],
    })),

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    })),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
    })),

  clearBlocks: () =>
    set(() => ({
      blocks: [],
    })),

  getHighestZIndex: () => {
    const state = get();
    if (state.blocks.length === 0) return 0;
    return Math.max(...state.blocks.map((block) => block.z));
  },
});

/**
 * Helper selectors for blocks state
 */
export const blocksSelectors = {
  getAllBlocks: (state: BlocksSlice) => state.blocks,
  getBlockById: (state: BlocksSlice, id: string) =>
    state.blocks.find((block) => block.id === id),
  getBlockCount: (state: BlocksSlice) => state.blocks.length,
  getBlocksByZIndex: (state: BlocksSlice) =>
    [...state.blocks].sort((a, b) => a.z - b.z),
};