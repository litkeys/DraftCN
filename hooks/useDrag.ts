import { useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '@/store';
import { dragManager } from '@/lib/drag/manager';

/**
 * Custom hook for handling drag operations
 * Provides reusable drag functionality with state management
 */
export interface UseDragOptions {
  sourceType: 'library' | 'canvas';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  onDragStart?: (e: PointerEvent, offset: { x: number; y: number }) => void;
  onDragMove?: (e: PointerEvent) => void;
  onDragEnd?: () => void;
}

export interface UseDragReturn {
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
}

export const useDrag = (options: UseDragOptions): UseDragReturn => {
  const { sourceType, item, onDragStart, onDragMove, onDragEnd } = options;
  const setDragState = useAppStore((state) => state.setDragState);
  const clearDragState = useAppStore((state) => state.clearDragState);
  const isDragging = useAppStore((state) => state.isActive);
  
  // Refs to store current values without re-renders
  const isDraggingRef = useRef(false);
  const pointerHandlersRef = useRef<{
    handlePointerMove: (e: PointerEvent) => void;
    handlePointerUp: (e: PointerEvent) => void;
  } | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  /**
   * Handle pointer move during drag
   */
  const handlePointerMove = useCallback((e: PointerEvent) => {
    // Only handle the original pointer
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    if (!isDraggingRef.current) return;

    // Update position in store
    setDragState({
      position: { x: e.clientX, y: e.clientY }
    });

    // Call custom move handler if provided
    onDragMove?.(e);
  }, [setDragState, onDragMove]);

  /**
   * Handle pointer up to end drag
   */
  const handlePointerUp = useCallback((e: PointerEvent) => {
    // Only handle the original pointer
    if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
    if (!isDraggingRef.current) return;

    // Clean up
    isDraggingRef.current = false;
    pointerIdRef.current = null;

    // Remove global event listeners
    if (pointerHandlersRef.current) {
      document.removeEventListener('pointermove', pointerHandlersRef.current.handlePointerMove);
      document.removeEventListener('pointerup', pointerHandlersRef.current.handlePointerUp);
      pointerHandlersRef.current = null;
    }

    // Check if we're dropping on the canvas using elementFromPoint
    const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
    if (elementUnderPointer) {
      // Find the canvas element (either the element itself or a parent)
      let canvasElement = elementUnderPointer;
      while (canvasElement && canvasElement !== document.body) {
        if (canvasElement.getAttribute('data-testid') === 'canvas') {
          // We found the canvas! Dispatch a pointerup event on it
          // This ensures Canvas's onPointerUp handler receives the event
          const pointerUpEvent = new PointerEvent('pointerup', {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY,
            pointerId: e.pointerId,
            pointerType: e.pointerType,
            isPrimary: e.isPrimary,
            button: e.button,
            buttons: e.buttons,
          });
          canvasElement.dispatchEvent(pointerUpEvent);

          // Call custom end handler if provided
          onDragEnd?.();
          return;
        }
        canvasElement = canvasElement.parentElement;
      }
    }

    // Not dropped on canvas, clean up drag state
    if (dragManager.isDragging()) {
      dragManager.endDrag();
      clearDragState();
    }

    // Call custom end handler if provided
    onDragEnd?.();
  }, [clearDragState, onDragEnd]);

  /**
   * Handle pointer down to start drag
   */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Prevent text selection during drag
    e.preventDefault();

    // Store the pointer ID for this drag operation
    pointerIdRef.current = e.pointerId;

    // Calculate initial offset from click position
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Start drag operation
    dragManager.startDrag(sourceType, item, offset);

    // Update store with drag state
    setDragState({
      isActive: true,
      sourceType,
      draggedItem: item,
      offset,
      position: { x: e.clientX, y: e.clientY }
    });

    // Set dragging flag
    isDraggingRef.current = true;

    // Store handlers for cleanup
    pointerHandlersRef.current = {
      handlePointerMove,
      handlePointerUp
    };

    // Add global event listeners
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    // Call custom start handler if provided
    onDragStart?.(e.nativeEvent, offset);
  }, [sourceType, item, setDragState, handlePointerMove, handlePointerUp, onDragStart]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      // Clean up any active drag on unmount
      if (isDraggingRef.current && pointerHandlersRef.current) {
        document.removeEventListener('pointermove', pointerHandlersRef.current.handlePointerMove);
        document.removeEventListener('pointerup', pointerHandlersRef.current.handlePointerUp);

        if (dragManager.isDragging()) {
          dragManager.cancelDrag();
          clearDragState();
        }
      }
    };
  }, [clearDragState]);

  return {
    isDragging,
    handlePointerDown
  };
};