import { create } from 'zustand'
import { DragSlice, createDragSlice } from './slices/drag'
import { BlocksSlice, createBlocksSlice } from './slices/blocks'
import { UISlice, createUISlice } from './slices/ui'

export interface AppState {
  // Placeholder for future state
  initialized: boolean
}

export interface AppActions {
  // Placeholder for future actions
  setInitialized: (initialized: boolean) => void
}

export type AppStore = AppState & AppActions & DragSlice & BlocksSlice & UISlice

export const useAppStore = create<AppStore>((...args) => ({
  // Initial state
  initialized: true,

  // Actions
  setInitialized: (initialized) => args[0]({ initialized }),

  // Drag slice
  ...createDragSlice(...args),

  // Blocks slice
  ...createBlocksSlice(...args),

  // UI slice
  ...createUISlice(...args),
}))
