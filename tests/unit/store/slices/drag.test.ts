import { describe, it, expect } from 'vitest';
import { createDragSlice, dragSelectors, type DragSlice } from '@/store/slices/drag';

describe('Drag Slice', () => {
  describe('Slice Creation', () => {
    it('should create slice with initial state', () => {
      const mockSet = () => {};
      const mockGet = () => ({} as DragSlice);
      
      const slice = createDragSlice(mockSet, mockGet, {} as any);
      
      expect(slice.isActive).toBe(false);
      expect(slice.sourceType).toBe(null);
      expect(slice.draggedItem).toBe(null);
      expect(slice.position).toEqual({ x: 0, y: 0 });
      expect(slice.offset).toEqual({ x: 0, y: 0 });
    });

    it('should create slice with action functions', () => {
      const mockSet = () => {};
      const mockGet = () => ({} as DragSlice);
      
      const slice = createDragSlice(mockSet, mockGet, {} as any);
      
      expect(typeof slice.setDragState).toBe('function');
      expect(typeof slice.updateDragPosition).toBe('function');
      expect(typeof slice.clearDragState).toBe('function');
    });
  });

  describe('Actions', () => {
    it('setDragState should call set with merged state', () => {
      let calledWith: any = null;
      const mockSet = (fn: any) => {
        calledWith = fn({ isActive: false, sourceType: null });
      };
      const mockGet = () => ({} as DragSlice);
      
      const slice = createDragSlice(mockSet, mockGet, {} as any);
      slice.setDragState({ isActive: true, sourceType: 'library' });
      
      expect(calledWith).toEqual(expect.objectContaining({
        isActive: true,
        sourceType: 'library',
      }));
    });

    it('updateDragPosition should update position', () => {
      let calledWith: any = null;
      const mockSet = (fn: any) => {
        calledWith = fn({ position: { x: 0, y: 0 } });
      };
      const mockGet = () => ({} as DragSlice);
      
      const slice = createDragSlice(mockSet, mockGet, {} as any);
      slice.updateDragPosition(100, 200);
      
      expect(calledWith).toEqual(expect.objectContaining({
        position: { x: 100, y: 200 },
      }));
    });

    it('clearDragState should reset to initial state', () => {
      let calledWith: any = null;
      const mockSet = (fn: any) => {
        calledWith = fn({});
      };
      const mockGet = () => ({} as DragSlice);
      
      const slice = createDragSlice(mockSet, mockGet, {} as any);
      slice.clearDragState();
      
      expect(calledWith).toEqual({
        isActive: false,
        sourceType: null,
        draggedItem: null,
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
      });
    });
  });

  describe('Selectors', () => {
    const mockState: DragSlice = {
      isActive: true,
      sourceType: 'canvas',
      draggedItem: { id: 'block-1' },
      position: { x: 150, y: 250 },
      offset: { x: 5, y: 10 },
      setDragState: () => {},
      updateDragPosition: () => {},
      clearDragState: () => {},
    };

    it('isDragging should return isActive state', () => {
      expect(dragSelectors.isDragging(mockState)).toBe(true);
      expect(dragSelectors.isDragging({ ...mockState, isActive: false })).toBe(false);
    });

    it('getDraggedItem should return draggedItem', () => {
      expect(dragSelectors.getDraggedItem(mockState)).toEqual({ id: 'block-1' });
      expect(dragSelectors.getDraggedItem({ ...mockState, draggedItem: null })).toBe(null);
    });

    it('getDragPosition should return position', () => {
      expect(dragSelectors.getDragPosition(mockState)).toEqual({ x: 150, y: 250 });
    });

    it('getDragOffset should return offset', () => {
      expect(dragSelectors.getDragOffset(mockState)).toEqual({ x: 5, y: 10 });
    });

    it('getDragSource should return sourceType', () => {
      expect(dragSelectors.getDragSource(mockState)).toBe('canvas');
      expect(dragSelectors.getDragSource({ ...mockState, sourceType: 'library' })).toBe('library');
    });
  });
});