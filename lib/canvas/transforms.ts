/**
 * Coordinate transformation utilities for canvas zoom and pan
 */

/**
 * Calculate the actual scale factor from zoom percentage
 * Formula: actualScale = zoomPercentage * 0.008
 * Examples: 100% zoom = 0.8 scale, 125% zoom = 1.0 scale
 */
export function calculateActualScale(zoomPercentage: number): number {
  return zoomPercentage * 0.008
}

/**
 * Convert screen coordinates to world coordinates (inverse transform)
 * Used for mouse events and input handling
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  const actualScale = calculateActualScale(zoom)

  return {
    x: (screenX - panX) / actualScale,
    y: (screenY - panY) / actualScale,
  }
}

/**
 * Convert world coordinates to screen coordinates (forward transform)
 * Used for rendering blocks and elements
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  const actualScale = calculateActualScale(zoom)

  return {
    x: worldX * actualScale + panX,
    y: worldY * actualScale + panY,
  }
}

/**
 * Transform world dimensions to screen dimensions
 * Used for scaling block sizes during rendering
 */
export function worldDimensionsToScreen(
  width: number,
  height: number,
  zoom: number
): { width: number; height: number } {
  const actualScale = calculateActualScale(zoom)

  return {
    width: width * actualScale,
    height: height * actualScale,
  }
}

/**
 * Transform screen dimensions to world dimensions
 * Used for calculating sizes during creation/resize operations
 */
export function screenDimensionsToWorld(
  width: number,
  height: number,
  zoom: number
): { width: number; height: number } {
  const actualScale = calculateActualScale(zoom)

  return {
    width: width / actualScale,
    height: height / actualScale,
  }
}

/**
 * Get mouse position relative to canvas in world coordinates
 * Accounts for canvas offset within the page
 */
export function getWorldMousePosition(
  event: MouseEvent,
  canvasElement: HTMLElement,
  zoom: number,
  panX: number,
  panY: number
): { x: number; y: number } {
  const rect = canvasElement.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top

  return screenToWorld(screenX, screenY, zoom, panX, panY)
}

/**
 * Check if a point in world coordinates is within a rectangle in world coordinates
 */
export function isPointInWorldRect(
  pointX: number,
  pointY: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  return (
    pointX >= rectX &&
    pointX <= rectX + rectWidth &&
    pointY >= rectY &&
    pointY <= rectY + rectHeight
  )
}