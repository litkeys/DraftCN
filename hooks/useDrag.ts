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
  onDragStart?: (e: MouseEvent, offset: { x: number; y: number }) => void;
  onDragMove?: (e: MouseEvent) => void;
  onDragEnd?: () => void;
}

export interface UseDragReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export const useDrag = (options: UseDragOptions): UseDragReturn => {
  const { sourceType, item, onDragStart, onDragMove, onDragEnd } = options;
  const setDragState = useAppStore((state) => state.setDragState);
  const clearDragState = useAppStore((state) => state.clearDragState);
  const isDragging = useAppStore((state) => state.isActive);
  
  // Refs to store current values without re-renders
  const isDraggingRef = useRef(false);
  const mouseHandlersRef = useRef<{
    handleMouseMove: (e: MouseEvent) => void;
    handleMouseUp: (e: MouseEvent) => void;
  } | null>(null);

  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // Update position in store
    setDragState({
      position: { x: e.clientX, y: e.clientY }
    });
    
    // Call custom move handler if provided
    onDragMove?.(e);
  }, [setDragState, onDragMove]);

  /**
   * Handle mouse up to end drag
   */
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // Clean up
    isDraggingRef.current = false;
    
    // Remove global event listeners
    if (mouseHandlersRef.current) {
      document.removeEventListener('mousemove', mouseHandlersRef.current.handleMouseMove);
      document.removeEventListener('mouseup', mouseHandlersRef.current.handleMouseUp);
      mouseHandlersRef.current = null;
    }
    
    // End drag will be handled by Canvas drop handler
    // For now, just clean up if not dropped on valid target
    if (dragManager.isDragging()) {
      dragManager.endDrag();
      clearDragState();
    }
    
    // Call custom end handler if provided
    onDragEnd?.();
  }, [clearDragState, onDragEnd]);

  /**
   * Handle mouse down to start drag
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault();
    
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
    mouseHandlersRef.current = {
      handleMouseMove,
      handleMouseUp
    };
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Call custom start handler if provided
    onDragStart?.(e.nativeEvent, offset);
  }, [sourceType, item, setDragState, handleMouseMove, handleMouseUp, onDragStart]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      // Clean up any active drag on unmount
      if (isDraggingRef.current && mouseHandlersRef.current) {
        document.removeEventListener('mousemove', mouseHandlersRef.current.handleMouseMove);
        document.removeEventListener('mouseup', mouseHandlersRef.current.handleMouseUp);
        
        if (dragManager.isDragging()) {
          dragManager.cancelDrag();
          clearDragState();
        }
      }
    };
  }, [clearDragState]);

  return {
    isDragging,
    handleMouseDown
  };
};