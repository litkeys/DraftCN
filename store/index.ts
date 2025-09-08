import { create } from 'zustand'

export interface AppState {
  // Placeholder for future state
  initialized: boolean
}

export interface AppActions {
  // Placeholder for future actions
  setInitialized: (initialized: boolean) => void
}

export type AppStore = AppState & AppActions

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  initialized: true,
  
  // Actions
  setInitialized: (initialized) => set({ initialized }),
}))