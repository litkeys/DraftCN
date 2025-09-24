import type { StateCreator } from 'zustand'

/**
 * UI state interface
 */
export interface UIState {
  zoom: number
  panX: number
  panY: number
}

/**
 * UI actions interface
 */
export interface UIActions {
  blurSearchInput: () => void
  registerSearchBlurCallback: (callback: () => void) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
}

/**
 * Combined UI slice type
 */
export type UISlice = UIState & UIActions

/**
 * Initial UI state
 */
const initialUIState: UIState = {
  zoom: 100,
  panX: 0,
  panY: 0,
}

// Store the search blur callback
let searchBlurCallback: (() => void) | null = null

/**
 * Create UI slice for Zustand store
 */
export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  // Initial state
  ...initialUIState,

  // Actions
  blurSearchInput: () => {
    if (searchBlurCallback) {
      searchBlurCallback()
    }
  },

  registerSearchBlurCallback: (callback) => {
    searchBlurCallback = callback
  },

  setZoom: (zoom) => set({ zoom }),

  setPan: (x, y) => set({ panX: x, panY: y }),
})

/**
 * Helper selectors for UI state
 */
export const uiSelectors = {
  // Can add UI selectors here if needed in the future
}
