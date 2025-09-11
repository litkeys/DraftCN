import { StateCreator } from 'zustand';

/**
 * Drag state interface
 */
export interface DragState {
  isActive: boolean;
  sourceType: 'library' | 'canvas' | null;
  draggedItem: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  position: {
    x: number;
    y: number;
  };
  offset: {
    x: number;
    y: number;
  };
}

/**
 * Drag actions interface
 */
export interface DragActions {
  setDragState: (state: Partial<DragState>) => void;
  updateDragPosition: (x: number, y: number) => void;
  clearDragState: () => void;
}

/**
 * Combined drag slice type
 */
export type DragSlice = DragState & DragActions;

/**
 * Initial drag state
 */
const initialDragState: DragState = {
  isActive: false,
  sourceType: null,
  draggedItem: null,
  position: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
};

/**
 * Create drag slice for Zustand store
 */
export const createDragSlice: StateCreator<DragSlice> = (set) => ({
  // Initial state
  ...initialDragState,

  // Actions
  setDragState: (state) =>
    set((prevState) => ({
      ...prevState,
      ...state,
    })),

  updateDragPosition: (x, y) =>
    set((state) => ({
      ...state,
      position: { x, y },
    })),

  clearDragState: () =>
    set(() => ({
      ...initialDragState,
    })),
});

/**
 * Helper selectors for drag state
 */
export const dragSelectors = {
  isDragging: (state: DragSlice) => state.isActive,
  getDraggedItem: (state: DragSlice) => state.draggedItem,
  getDragPosition: (state: DragSlice) => state.position,
  getDragOffset: (state: DragSlice) => state.offset,
  getDragSource: (state: DragSlice) => state.sourceType,
};