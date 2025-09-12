import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDrag } from '@/hooks/useDrag';
import { dragManager } from '@/lib/drag/manager';
import { useAppStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useAppStore: vi.fn(),
}));

// Mock drag manager
vi.mock('@/lib/drag/manager', () => ({
  dragManager: {
    startDrag: vi.fn(),
    endDrag: vi.fn(),
    cancelDrag: vi.fn(),
    isDragging: vi.fn(() => false),
  },
}));

describe('useDrag', () => {
  const mockSetDragState = vi.fn();
  const mockClearDragState = vi.fn();
  const mockTemplate = { 
    typeId: 'test-template', 
    name: 'Test Template' 
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup store mock
    (useAppStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector({
          setDragState: mockSetDragState,
          clearDragState: mockClearDragState,
          isActive: false,
        });
      }
      return mockSetDragState;
    });

    // Reset document event listeners
    const listeners = (document as any)._eventListeners;
    if (listeners) {
      delete listeners.mousemove;
      delete listeners.mouseup;
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return isDragging as false initially', () => {
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      expect(result.current.isDragging).toBe(false);
    });

    it('should return handleMouseDown function', () => {
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      expect(typeof result.current.handleMouseDown).toBe('function');
    });
  });

  describe('handleMouseDown', () => {
    it('should start drag operation on mouse down', () => {
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 50,
            top: 100,
            right: 250,
            bottom: 200,
            width: 200,
            height: 100,
          }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      // Should prevent default
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      // Should start drag with correct parameters
      expect(dragManager.startDrag).toHaveBeenCalledWith(
        'library',
        mockTemplate,
        { x: 50, y: 100 } // offset calculated from clientX/Y - rect.left/top
      );

      // Should update store state
      expect(mockSetDragState).toHaveBeenCalledWith({
        isActive: true,
        sourceType: 'library',
        draggedItem: mockTemplate,
        offset: { x: 50, y: 100 },
        position: { x: 100, y: 200 },
      });
    });

    it('should add global event listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 0,
            top: 0,
          }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should call onDragStart callback if provided', () => {
      const onDragStart = vi.fn();
      
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate,
          onDragStart 
        })
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 50,
            top: 100,
          }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      expect(onDragStart).toHaveBeenCalledWith(
        mockEvent.nativeEvent,
        { x: 50, y: 100 }
      );
    });
  });

  describe('Mouse Move Handling', () => {
    it('should update position on mouse move', () => {
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      const mockMouseDown = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockMouseDown);
      });

      // Clear previous calls
      mockSetDragState.mockClear();

      // Simulate mouse move
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 250,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(mockSetDragState).toHaveBeenCalledWith({
        position: { x: 150, y: 250 },
      });
    });

    it('should call onDragMove callback if provided', () => {
      const onDragMove = vi.fn();
      
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate,
          onDragMove 
        })
      );

      const mockMouseDown = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockMouseDown);
      });

      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 250,
      });

      act(() => {
        document.dispatchEvent(mouseMoveEvent);
      });

      expect(onDragMove).toHaveBeenCalledWith(mouseMoveEvent);
    });
  });

  describe('Mouse Up Handling', () => {
    it('should end drag on mouse up', () => {
      (dragManager.isDragging as any).mockReturnValue(true);
      
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      const mockMouseDown = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockMouseDown);
      });

      // Simulate mouse up
      const mouseUpEvent = new MouseEvent('mouseup');

      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });

      expect(dragManager.endDrag).toHaveBeenCalled();
      expect(mockClearDragState).toHaveBeenCalled();
    });

    it('should remove event listeners on mouse up', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      const mockMouseDown = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockMouseDown);
      });

      const mouseUpEvent = new MouseEvent('mouseup');

      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should call onDragEnd callback if provided', () => {
      const onDragEnd = vi.fn();
      
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate,
          onDragEnd 
        })
      );

      const mockMouseDown = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockMouseDown);
      });

      const mouseUpEvent = new MouseEvent('mouseup');

      act(() => {
        document.dispatchEvent(mouseUpEvent);
      });

      expect(onDragEnd).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clean up on unmount if dragging', () => {
      (dragManager.isDragging as any).mockReturnValue(true);
      
      const { result, unmount } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      // Start a drag to set isDraggingRef.current to true
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 50,
            top: 100,
            right: 150,
            bottom: 200,
          }),
        },
        nativeEvent: {},
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      // Now unmount while dragging
      unmount();

      expect(dragManager.cancelDrag).toHaveBeenCalled();
      expect(mockClearDragState).toHaveBeenCalled();
    });

    it('should not clean up on unmount if not dragging', () => {
      (dragManager.isDragging as any).mockReturnValue(false);
      
      const { unmount } = renderHook(() => 
        useDrag({ 
          sourceType: 'library', 
          item: mockTemplate 
        })
      );

      unmount();

      expect(dragManager.cancelDrag).not.toHaveBeenCalled();
      expect(mockClearDragState).not.toHaveBeenCalled();
    });
  });

  describe('Different Source Types', () => {
    it('should handle canvas source type', () => {
      const mockBlock = { id: 'block-1', typeId: 'test-block' };
      
      const { result } = renderHook(() => 
        useDrag({ 
          sourceType: 'canvas', 
          item: mockBlock 
        })
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        },
        nativeEvent: new MouseEvent('mousedown'),
      } as any;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      expect(dragManager.startDrag).toHaveBeenCalledWith(
        'canvas',
        mockBlock,
        expect.any(Object)
      );

      expect(mockSetDragState).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceType: 'canvas',
          draggedItem: mockBlock,
        })
      );
    });
  });
});