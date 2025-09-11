import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DragManager } from '@/lib/drag/manager';

describe('DragManager', () => {
  let manager: DragManager;

  beforeEach(() => {
    // Reset singleton instance before each test
    DragManager.resetInstance();
    manager = DragManager.getInstance();
  });

  afterEach(() => {
    // Clean up after each test
    DragManager.resetInstance();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DragManager.getInstance();
      const instance2 = DragManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance properly', () => {
      const instance1 = DragManager.getInstance();
      DragManager.resetInstance();
      const instance2 = DragManager.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('startDrag', () => {
    it('should start drag from library', () => {
      const template = { typeId: 'test-template', name: 'Test' };
      manager.startDrag('library', template);
      
      const state = manager.getDragState();
      expect(state.isActive).toBe(true);
      expect(state.sourceType).toBe('library');
      expect(state.draggedItem).toEqual(template);
    });

    it('should start drag from canvas', () => {
      const block = { id: 'block-1', typeId: 'test-block' };
      manager.startDrag('canvas', block);
      
      const state = manager.getDragState();
      expect(state.isActive).toBe(true);
      expect(state.sourceType).toBe('canvas');
      expect(state.draggedItem).toEqual(block);
    });

    it('should accept initial position for offset', () => {
      const template = { typeId: 'test-template' };
      const initialPosition = { x: 100, y: 200 };
      manager.startDrag('library', template, initialPosition);
      
      const state = manager.getDragState();
      expect(state.offset).toEqual(initialPosition);
    });

    it('should add escape key listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      manager.startDrag('library', {});
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should notify state change', () => {
      const callback = vi.fn();
      manager.onStateChange(callback);
      manager.startDrag('library', {});
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        isActive: true,
        sourceType: 'library',
      }));
    });
  });

  describe('updateDragPosition', () => {
    it('should do nothing if drag is not active', () => {
      const callback = vi.fn();
      manager.onStateChange(callback);
      manager.updateDragPosition(100, 200);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should notify state change when drag is active', () => {
      const callback = vi.fn();
      manager.onStateChange(callback);
      manager.startDrag('library', {});
      callback.mockClear();
      
      manager.updateDragPosition(100, 200);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('endDrag', () => {
    it('should reset drag state', () => {
      manager.startDrag('library', { typeId: 'test' });
      expect(manager.isDragging()).toBe(true);
      
      manager.endDrag();
      expect(manager.isDragging()).toBe(false);
      
      const state = manager.getDragState();
      expect(state.isActive).toBe(false);
      expect(state.sourceType).toBe(null);
      expect(state.draggedItem).toBe(null);
      expect(state.offset).toEqual({ x: 0, y: 0 });
    });

    it('should remove escape key listener', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      manager.startDrag('library', {});
      manager.endDrag();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should notify state change', () => {
      const callback = vi.fn();
      manager.onStateChange(callback);
      manager.startDrag('library', {});
      callback.mockClear();
      
      manager.endDrag();
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        isActive: false,
      }));
    });
  });

  describe('cancelDrag', () => {
    it('should reset drag state', () => {
      manager.startDrag('canvas', { id: 'block-1' });
      expect(manager.isDragging()).toBe(true);
      
      manager.cancelDrag();
      expect(manager.isDragging()).toBe(false);
      
      const state = manager.getDragState();
      expect(state.isActive).toBe(false);
      expect(state.sourceType).toBe(null);
      expect(state.draggedItem).toBe(null);
    });

    it('should remove escape key listener', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      manager.startDrag('canvas', {});
      manager.cancelDrag();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should notify state change', () => {
      const callback = vi.fn();
      manager.onStateChange(callback);
      manager.startDrag('canvas', {});
      callback.mockClear();
      
      manager.cancelDrag();
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        isActive: false,
      }));
    });
  });

  describe('Escape Key Handling', () => {
    it('should cancel drag on Escape key press', () => {
      manager.startDrag('library', { typeId: 'test' });
      expect(manager.isDragging()).toBe(true);
      
      // Simulate Escape key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      expect(manager.isDragging()).toBe(false);
    });

    it('should not cancel drag on other key press', () => {
      manager.startDrag('library', { typeId: 'test' });
      expect(manager.isDragging()).toBe(true);
      
      // Simulate Enter key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);
      
      expect(manager.isDragging()).toBe(true);
    });

    it('should not throw error if escape is pressed when not dragging', () => {
      expect(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      }).not.toThrow();
    });
  });

  describe('isDragging', () => {
    it('should return false initially', () => {
      expect(manager.isDragging()).toBe(false);
    });

    it('should return true after startDrag', () => {
      manager.startDrag('library', {});
      expect(manager.isDragging()).toBe(true);
    });

    it('should return false after endDrag', () => {
      manager.startDrag('library', {});
      manager.endDrag();
      expect(manager.isDragging()).toBe(false);
    });

    it('should return false after cancelDrag', () => {
      manager.startDrag('library', {});
      manager.cancelDrag();
      expect(manager.isDragging()).toBe(false);
    });
  });

  describe('getDragState', () => {
    it('should return copy of drag state', () => {
      const template = { typeId: 'test' };
      manager.startDrag('library', template);
      
      const state1 = manager.getDragState();
      const state2 = manager.getDragState();
      
      expect(state1).not.toBe(state2); // Different object references
      expect(state1).toEqual(state2); // Same content
    });

    it('should return initial state before any drag', () => {
      const state = manager.getDragState();
      expect(state).toEqual({
        isActive: false,
        sourceType: null,
        draggedItem: null,
        offset: { x: 0, y: 0 },
      });
    });
  });

  describe('onStateChange', () => {
    it('should register callback for state changes', () => {
      const callback = vi.fn();
      manager.onStateChange(callback);
      
      manager.startDrag('library', {});
      expect(callback).toHaveBeenCalledTimes(1);
      
      manager.updateDragPosition(100, 200);
      expect(callback).toHaveBeenCalledTimes(2);
      
      manager.endDrag();
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should replace previous callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      manager.onStateChange(callback1);
      manager.onStateChange(callback2);
      
      manager.startDrag('library', {});
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});