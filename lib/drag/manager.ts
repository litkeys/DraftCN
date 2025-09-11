/**
 * DragManager - Coordinates all drag-and-drop operations
 */
export class DragManager {
  private static instance: DragManager | null = null;
  private dragState: {
    isActive: boolean;
    sourceType: 'library' | 'canvas' | null;
    draggedItem: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    offset: { x: number; y: number };
  } = {
    isActive: false,
    sourceType: null,
    draggedItem: null,
    offset: { x: 0, y: 0 },
  };

  private escapeKeyListener: ((e: KeyboardEvent) => void) | null = null;
  private updateCallback: ((state: typeof this.dragState) => void) | null = null;

  private constructor() {}

  /**
   * Get singleton instance of DragManager
   */
  public static getInstance(): DragManager {
    if (!DragManager.instance) {
      DragManager.instance = new DragManager();
    }
    return DragManager.instance;
  }

  /**
   * Set callback for state updates
   */
  public onStateChange(callback: (state: typeof this.dragState) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Start drag operation
   * @param source - Source of drag operation ('library' or 'canvas')
   * @param item - Item being dragged
   * @param initialPosition - Initial cursor position for offset calculation
   */
  public startDrag(
    source: 'library' | 'canvas',
    item: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    initialPosition?: { x: number; y: number }
  ): void {
    this.dragState = {
      isActive: true,
      sourceType: source,
      draggedItem: item,
      offset: initialPosition || { x: 0, y: 0 },
    };

    // Add Escape key listener
    this.escapeKeyListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.cancelDrag();
      }
    };
    document.addEventListener('keydown', this.escapeKeyListener);

    // Notify state change
    this.notifyStateChange();
  }

  /**
   * Update drag position
   * @param _x - Current cursor X position
   * @param _y - Current cursor Y position
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public updateDragPosition(_x: number, _y: number): void {
    if (!this.dragState.isActive) return;

    // Position is handled externally via store
    // This method mainly exists for interface consistency
    // and potential future position tracking needs
    
    // Notify any position-specific logic if needed
    this.notifyStateChange();
  }

  /**
   * End drag operation successfully
   */
  public endDrag(): void {
    this.cleanup();
  }

  /**
   * Cancel drag operation
   */
  public cancelDrag(): void {
    this.cleanup();
  }

  /**
   * Get current drag state
   */
  public getDragState(): typeof this.dragState {
    return { ...this.dragState };
  }

  /**
   * Check if drag is currently active
   */
  public isDragging(): boolean {
    return this.dragState.isActive;
  }

  /**
   * Clean up drag state and listeners
   */
  private cleanup(): void {
    // Remove Escape key listener
    if (this.escapeKeyListener) {
      document.removeEventListener('keydown', this.escapeKeyListener);
      this.escapeKeyListener = null;
    }

    // Reset drag state
    this.dragState = {
      isActive: false,
      sourceType: null,
      draggedItem: null,
      offset: { x: 0, y: 0 },
    };

    // Notify state change
    this.notifyStateChange();
  }

  /**
   * Notify registered callback of state change
   */
  private notifyStateChange(): void {
    if (this.updateCallback) {
      this.updateCallback(this.getDragState());
    }
  }

  /**
   * Reset singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    if (DragManager.instance) {
      DragManager.instance.cleanup();
      DragManager.instance = null;
    }
  }
}

// Export singleton instance getter for convenience
export const dragManager = DragManager.getInstance();