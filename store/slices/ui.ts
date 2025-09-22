import type { StateCreator } from 'zustand'

/**
 * UI state interface
 */
export interface UIState {
  // UI state can be extended here if needed in the future
}

/**
 * UI actions interface
 */
export interface UIActions {
  blurSearchInput: () => void
  registerSearchBlurCallback: (callback: () => void) => void
}

/**
 * Combined UI slice type
 */
export type UISlice = UIState & UIActions

/**
 * Initial UI state
 */
const initialUIState: UIState = {
  // Empty for now, can be extended
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
})

/**
 * Helper selectors for UI state
 */
export const uiSelectors = {
  // Can add UI selectors here if needed in the future
}
