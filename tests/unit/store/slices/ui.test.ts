import { describe, it, expect, beforeEach } from 'vitest'
import { create } from 'zustand'
import { createUISlice, UISlice } from '@/store/slices/ui'

describe('UISlice', () => {
  let store: ReturnType<typeof create<UISlice>>

  beforeEach(() => {
    store = create<UISlice>(createUISlice)
  })

  describe('zoom state', () => {
    it('should have default zoom value of 100', () => {
      const state = store.getState()
      expect(state.zoom).toBe(100)
    })

    it('should update zoom value with setZoom', () => {
      store.getState().setZoom(150)
      expect(store.getState().zoom).toBe(150)
    })

    it('should allow zoom values from 25 to 200', () => {
      store.getState().setZoom(25)
      expect(store.getState().zoom).toBe(25)

      store.getState().setZoom(200)
      expect(store.getState().zoom).toBe(200)
    })

    it('should handle discrete zoom steps', () => {
      const discreteSteps = [25, 50, 75, 100, 125, 150, 175, 200]
      discreteSteps.forEach(step => {
        store.getState().setZoom(step)
        expect(store.getState().zoom).toBe(step)
      })
    })
  })

  describe('pan state', () => {
    it('should have default pan values of 0', () => {
      const state = store.getState()
      expect(state.panX).toBe(0)
      expect(state.panY).toBe(0)
    })

    it('should update pan values with setPan', () => {
      store.getState().setPan(100, 200)
      const state = store.getState()
      expect(state.panX).toBe(100)
      expect(state.panY).toBe(200)
    })

    it('should handle negative pan values', () => {
      store.getState().setPan(-50, -100)
      const state = store.getState()
      expect(state.panX).toBe(-50)
      expect(state.panY).toBe(-100)
    })

    it('should update pan values independently', () => {
      store.getState().setPan(25, 50)
      expect(store.getState().panX).toBe(25)
      expect(store.getState().panY).toBe(50)

      store.getState().setPan(75, 50)
      expect(store.getState().panX).toBe(75)
      expect(store.getState().panY).toBe(50)

      store.getState().setPan(75, 100)
      expect(store.getState().panX).toBe(75)
      expect(store.getState().panY).toBe(100)
    })
  })

  describe('existing functionality', () => {
    it('should register and call search blur callback', () => {
      let callbackCalled = false
      const callback = () => {
        callbackCalled = true
      }

      store.getState().registerSearchBlurCallback(callback)
      store.getState().blurSearchInput()

      expect(callbackCalled).toBe(true)
    })

    it('should not throw error if blur is called without callback', () => {
      expect(() => {
        store.getState().blurSearchInput()
      }).not.toThrow()
    })
  })
})