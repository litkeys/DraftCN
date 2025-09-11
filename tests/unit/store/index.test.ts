import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store';
import { renderHook, act } from '@testing-library/react';

describe('AppStore with Drag Slice Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.clearDragState();
      result.current.setInitialized(true);
    });
  });

  describe('Drag Slice Integration', () => {
    it('should have drag state in the store', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.isActive).toBeDefined();
      expect(result.current.sourceType).toBeDefined();
      expect(result.current.draggedItem).toBeDefined();
      expect(result.current.position).toBeDefined();
      expect(result.current.offset).toBeDefined();
    });

    it('should have drag actions in the store', () => {
      const { result } = renderHook(() => useAppStore());

      expect(typeof result.current.setDragState).toBe('function');
      expect(typeof result.current.updateDragPosition).toBe('function');
      expect(typeof result.current.clearDragState).toBe('function');
    });

    it('should update drag state through store actions', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setDragState({
          isActive: true,
          sourceType: 'library',
          draggedItem: { typeId: 'test-template' },
        });
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.sourceType).toBe('library');
      expect(result.current.draggedItem).toEqual({ typeId: 'test-template' });
    });

    it('should update drag position', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.updateDragPosition(100, 200);
      });

      expect(result.current.position).toEqual({ x: 100, y: 200 });
    });

    it('should clear drag state', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setDragState({
          isActive: true,
          sourceType: 'canvas',
          draggedItem: { id: 'block-1' },
          position: { x: 50, y: 50 },
        });
      });

      act(() => {
        result.current.clearDragState();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.sourceType).toBe(null);
      expect(result.current.draggedItem).toBe(null);
      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('App State Integration', () => {
    it('should still have app state alongside drag state', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.initialized).toBeDefined();
      expect(typeof result.current.setInitialized).toBe('function');
    });

    it('should update app state independently of drag state', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setInitialized(false);
        result.current.setDragState({
          isActive: true,
          sourceType: 'library',
        });
      });

      expect(result.current.initialized).toBe(false);
      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.setInitialized(true);
      });

      expect(result.current.initialized).toBe(true);
      expect(result.current.isActive).toBe(true); // Drag state unchanged
    });
  });

  describe('Multiple State Updates', () => {
    it('should handle rapid state updates', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setDragState({ isActive: true });
        result.current.updateDragPosition(10, 10);
        result.current.updateDragPosition(20, 20);
        result.current.updateDragPosition(30, 30);
        result.current.setDragState({ sourceType: 'library' });
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.position).toEqual({ x: 30, y: 30 });
      expect(result.current.sourceType).toBe('library');
    });

    it('should handle state transitions correctly', () => {
      const { result } = renderHook(() => useAppStore());

      // Simulate drag from library
      act(() => {
        result.current.setDragState({
          isActive: true,
          sourceType: 'library',
          draggedItem: { typeId: 'template-1' },
          offset: { x: 5, y: 5 },
        });
      });

      // Update position during drag
      act(() => {
        result.current.updateDragPosition(100, 150);
      });

      expect(result.current.position).toEqual({ x: 100, y: 150 });

      // Complete drag
      act(() => {
        result.current.clearDragState();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.position).toEqual({ x: 0, y: 0 });

      // Start new drag from canvas
      act(() => {
        result.current.setDragState({
          isActive: true,
          sourceType: 'canvas',
          draggedItem: { id: 'block-1' },
        });
      });

      expect(result.current.sourceType).toBe('canvas');
      expect(result.current.draggedItem).toEqual({ id: 'block-1' });
    });
  });
});